import json
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, redirect
from .models import Product, Order, OrderItem, Favorite, Address, Shipment, ContactMessage
from datetime import timedelta
from django.utils import timezone
import hmac
import hashlib
import requests
import os
from urllib.parse import urlencode
from django.core.mail import send_mail
from django.conf import settings

User = get_user_model()

def api_home(request):
    return JsonResponse({"mensaje": "¡El Backend está vivo!"})

def get_products(request):
    products_queryset = Product.objects.filter(is_active=True)
    products_list = []
    for product in products_queryset:
        main_image_obj = product.images.filter(is_main=True).first()
        if not main_image_obj:
            main_image_obj = product.images.first()
            
        image_url = main_image_obj.image.url if main_image_obj else None
        all_images = [img.image.url for img in product.images.all()]
        products_list.append({
            'id': product.id,
            'name': product.name,
            'price': float(product.price),
            'stock': product.stock,
            'category__name': product.category.name if product.category else "Sin categoría",
            'main_image': image_url,
            'all_images': all_images,
            'description': product.description,
            'is_featured': product.is_featured
        })
    return JsonResponse(products_list, safe=False)

@csrf_exempt
def register_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            nombre = data.get('nombre')
            email = data.get('email')
            password = data.get('password')

            if User.objects.filter(email=email).exists():
                return JsonResponse({'error': 'Este correo ya está registrado.'}, status=400)

            user = User.objects.create_user(username=email, email=email, password=password, first_name=nombre)
            return JsonResponse({'mensaje': '¡Cuenta creada con éxito!'}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Método no permitido'}, status=405)


@csrf_exempt
def create_payment(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            amount = int(data.get('amount', 0))
            email = data.get('email', 'cliente@policromica.cl')
            cart_items = data.get('cart', [])
            shipping_data = data.get('shipping', {})
            
            nombre_cliente = f"{shipping_data.get('nombre', '')} {shipping_data.get('apellido', '')}".strip() or 'Cliente Invitado'
            user, created = User.objects.get_or_create(
                email=email,
                defaults={'username': email, 'first_name': nombre_cliente}
            )

            address = Address.objects.create(
                user=user,
                street_address=shipping_data.get('direccion', 'Sin dirección'),
                city=shipping_data.get('ciudad', 'Sin ciudad'),
                state='N/A',
                zip_code='0000000',
            )

            order = Order.objects.create(
                user=user,
                shipping_address=address,
                total_amount=amount,
                status=Order.StatusChoices.PENDING
            )

            for item in cart_items:
                try:
                    product = Product.objects.get(id=item['id'])
                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        quantity=item['quantity']
                    )
                except Product.DoesNotExist:
                    continue
            
            commerce_order = f"POLI-{order.id}"

            api_key = os.environ.get("FLOW_API_KEY")
            secret_key = os.environ.get("FLOW_SECRET_KEY")
            api_url = "https://sandbox.flow.cl/api"

            params = {
                "apiKey": api_key,
                "commerceOrder": commerce_order,
                "subject": f"Pedido {commerce_order} en Policrómica",
                "currency": "CLP",
                "amount": amount,
                "email": email,
                "urlConfirmation": "https://tienda-backend-fn64.onrender.com/api/payment/confirm/", 
                "urlReturn": "https://tienda-backend-fn64.onrender.com/api/payment/final-redirect/", 
            }

            sorted_params = sorted(params.items(), key=lambda x: x[0])
            to_sign = "".join([f"{key}{value}" for key, value in sorted_params])
            signature = hmac.new(secret_key.encode(), to_sign.encode(), hashlib.sha256).hexdigest()
            params["s"] = signature

            encoded_body = urlencode(params)
            response = requests.post(f"{api_url}/payment/create", data=encoded_body, headers={'Content-Type':'application/x-www-form-urlencoded'})
            
            if response.status_code == 200:
                flow_data = response.json()
                payment_url = f"{flow_data['url']}?token={flow_data['token']}"
                return JsonResponse({'url': payment_url}, status=200)
            else:
                return JsonResponse({'error': 'Error comunicando con Flow', 'details': response.text}, status=400)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Método no permitido'}, status=405)


@csrf_exempt
def payment_confirm(request):
    if request.method == 'POST':
        token = request.POST.get('token')
        if token:
            api_key = os.environ.get("FLOW_API_KEY")
            secret_key = os.environ.get("FLOW_SECRET_KEY")
            
            params = {"apiKey": api_key, "token": token}
            sorted_params = sorted(params.items(), key=lambda x: x[0])
            to_sign = "".join([f"{key}{value}" for key, value in sorted_params])
            params["s"] = hmac.new(secret_key.encode(), to_sign.encode(), hashlib.sha256).hexdigest()
            
            res = requests.get("https://sandbox.flow.cl/api/payment/getStatus", params=params)
            
            if res.status_code == 200:
                flow_data = res.json()
                status = flow_data.get('status')
                order_id_str = flow_data.get('commerceOrder', '')
                
                if status == 2 and order_id_str.startswith('POLI-'):
                    order_id = int(order_id_str.replace('POLI-', ''))
                    try:
                        order = Order.objects.get(id=order_id)
                        
                        if order.status != Order.StatusChoices.PAID:
                            order.status = Order.StatusChoices.PAID
                            order.save()
                            
                            items_html = ""
                            subtotal_productos = 0
                            
                            for item in order.items.all():
                                product = item.product
                                if product.stock >= item.quantity:
                                    product.stock -= item.quantity
                                else:
                                    product.stock = 0
                                product.save()
                                
                                # Calculamos el subtotal de este item y lo sumamos al total de productos
                                subtotal_item = int(item.unit_price * item.quantity)
                                subtotal_productos += subtotal_item
                                items_html += f'<li style="margin-bottom: 8px; color: #374151; font-size: 14px;"><strong>{item.quantity}x</strong> {product.name} <span style="color: #db2777; font-weight: bold; float: right;">${subtotal_item}</span></li>'
                            
                            # Calculamos el costo de envío (Total - Subtotal productos)
                            costo_envio = int(order.total_amount) - subtotal_productos
                            if costo_envio < 0:
                                costo_envio = 0
                            
                            # =========================================================
                            # LÓGICA DE ENVÍO DE CORREO AL CLIENTE
                            # =========================================================
                            try:
                                subject = f"¡Tu pedido {order_id_str} está confirmado! - Policrómica"
                                
                                html_message = f"""
                                <html>
                                <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 20px; background-color: #f9fafb;">
                                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
                                        <div style="background-color: #b3f3f5; padding: 30px; text-align: center;">
                                            <h1 style="color: #083344; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">¡Pago Exitoso!</h1>
                                        </div>
                                        <div style="padding: 30px;">
                                            <p style="font-size: 16px;">Hola <strong>{order.user.first_name or 'Cliente'}</strong>,</p>
                                            <p style="font-size: 16px;">Hemos recibido tu pago correctamente. Tu pedido ya está en cola para ser preparado.</p>
                                            
                                            <div style="background-color: #feecd4; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #fbbf24;">
                                                <h2 style="margin-top: 0; color: #9d174d; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Resumen de tu pedido</h2>
                                                
                                                <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
                                                    <p style="margin: 0 0 5px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: bold;">Código de Seguimiento</p>
                                                    <p style="font-size: 28px; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: 2px;">{order_id_str}</p>
                                                </div>
                                                
                                                <p style="font-size: 12px; color: #6b7280; margin-top: 0; text-align: center;">(Ingresa este código en nuestra sección de Envíos para rastrear tu paquete)</p>
                                                
                                                <hr style="border: 0; border-top: 1px dashed #f59e0b; margin: 20px 0;">
                                                
                                                <ul style="list-style-type: none; padding: 0; margin: 0;">
                                                    {items_html}
                                                </ul>
                                                
                                                <hr style="border: 0; border-top: 1px dashed #f59e0b; margin: 20px 0;">
                                                
                                                <div style="text-align: right; font-size: 14px; color: #4b5563;">
                                                    <p style="margin: 5px 0;">Subtotal Productos: ${subtotal_productos}</p>
                                                    <p style="margin: 5px 0;">Envío: ${costo_envio}</p>
                                                    <p style="font-size: 20px; margin: 10px 0 0 0; color: #be185d;"><strong>Total Pagado: <span style="font-size: 24px;">${int(order.total_amount)}</span></strong></p>
                                                </div>
                                            </div>
                                            
                                            <p style="font-size: 14px; color: #6b7280;">Te enviaremos una notificación cuando tu paquete vaya en camino.</p>
                                            <p style="font-size: 16px; margin-bottom: 0;">Un abrazo,<br><strong style="color: #db2777;">El equipo de Policrómica</strong></p>
                                        </div>
                                    </div>
                                </body>
                                </html>
                                """
                                
                                plain_message = f"Hola {order.user.first_name},\n\nTu pedido {order_id_str} ha sido confirmado. Total pagado: ${int(order.total_amount)}.\n\nGuarda tu código para rastrearlo en la página.\n\nGracias por comprar en Policrómica."
                                
                                send_mail(
                                    subject=subject,
                                    message=plain_message,
                                    from_email=settings.DEFAULT_FROM_EMAIL,
                                    recipient_list=[order.user.email],
                                    html_message=html_message,
                                    fail_silently=False # Lo ponemos en False un momento solo para ver si hay un error real en los logs de Render
                                )
                                print(f"Correo enviado exitosamente a {order.user.email}")
                            except Exception as email_error:
                                print("=========================================")
                                print(f"ERROR AL ENVIAR CORREO: {email_error}")
                                print("=========================================")
                                    
                    except Order.DoesNotExist:
                        print(f"La orden {order_id} no existe en la base de datos.")
                        pass
                        
            return JsonResponse({'status': 'ok'}, status=200)
    return JsonResponse({'error': 'Método no permitido'}, status=400)

@csrf_exempt
def payment_final_redirect(request):
    if request.method == 'POST':
        token = request.POST.get('token')
        frontend_url = "https://policromica.vercel.app/checkout/status"
        
        if token:
            api_key = os.environ.get("FLOW_API_KEY")
            secret_key = os.environ.get("FLOW_SECRET_KEY")
            params = {"apiKey": api_key, "token": token}
            sorted_params = sorted(params.items(), key=lambda x: x[0])
            to_sign = "".join([f"{key}{value}" for key, value in sorted_params])
            params["s"] = hmac.new(secret_key.encode(), to_sign.encode(), hashlib.sha256).hexdigest()
            
            res = requests.get(f"https://sandbox.flow.cl/api/payment/getStatus", params=params)
            order_id = ""
            if res.status_code == 200:
                order_id = res.json().get('commerceOrder', '')

            return redirect(f"{frontend_url}?token={token}&order={order_id}")
        
        return redirect(frontend_url)
    return redirect("https://policromica.vercel.app")

@csrf_exempt
def retry_payment(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            order_id = data.get('order_id')
            email = data.get('email')

            if not order_id or not email:
                return JsonResponse({'error': 'Faltan datos'}, status=400)

            order = Order.objects.get(id=order_id, user__email=email, status=Order.StatusChoices.PENDING)
            
            expiration_threshold = timezone.now() - timedelta(hours=6)
            if order.created_at < expiration_threshold:
                return JsonResponse({'error': 'Esta orden ha expirado por inactividad. Por favor, realiza un nuevo pedido.'}, status=400)

            commerce_order = f"POLI-{order.id}"
            amount = int(order.total_amount)

            api_key = os.environ.get("FLOW_API_KEY")
            secret_key = os.environ.get("FLOW_SECRET_KEY")
            api_url = "https://sandbox.flow.cl/api"

            params = {
                "apiKey": api_key,
                "commerceOrder": commerce_order,
                "subject": f"Reintento Pago Pedido {commerce_order} en Policrómica",
                "currency": "CLP",
                "amount": amount,
                "email": email,
                "urlConfirmation": "https://tienda-backend-fn64.onrender.com/api/payment/confirm/", 
                "urlReturn": "https://tienda-backend-fn64.onrender.com/api/payment/final-redirect/", 
            }

            sorted_params = sorted(params.items(), key=lambda x: x[0])
            to_sign = "".join([f"{key}{value}" for key, value in sorted_params])
            signature = hmac.new(secret_key.encode(), to_sign.encode(), hashlib.sha256).hexdigest()
            params["s"] = signature

            encoded_body = urlencode(params)
            response = requests.post(f"{api_url}/payment/create", data=encoded_body, headers={'Content-Type':'application/x-www-form-urlencoded'})
            
            if response.status_code == 200:
                flow_data = response.json()
                payment_url = f"{flow_data['url']}?token={flow_data['token']}"
                return JsonResponse({'url': payment_url}, status=200)
            else:
                return JsonResponse({'error': 'Error reintentando pago con Flow', 'details': response.text}, status=400)

        except Order.DoesNotExist:
            return JsonResponse({'error': 'Orden no encontrada o ya pagada'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
            
    return JsonResponse({'error': 'Método no permitido'}, status=405)


@csrf_exempt
def get_user_profile(request):
    email = request.GET.get('email')
    if not email:
        return JsonResponse({'error': 'Faltan datos'}, status=400)
    try:
        user = User.objects.get(email=email)
        address = user.addresses.first()
        return JsonResponse({
            'nombre': user.first_name,
            'telefono': user.phone or '',
            'direccion': address.street_address if address else '',
            'ciudad': address.city if address else '',
        }, status=200)
    except User.DoesNotExist:
        return JsonResponse({'error': 'Usuario no encontrado'}, status=404)

@csrf_exempt
def update_user_profile(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            if not email:
                return JsonResponse({'error': 'Faltan datos'}, status=400)
            
            user = User.objects.get(email=email)
            user.first_name = data.get('nombre', user.first_name)
            user.phone = data.get('telefono', user.phone)
            user.save()
            
            addr_str = data.get('direccion')
            city_str = data.get('ciudad')
            
            if addr_str or city_str:
                address = user.addresses.first()
                if address:
                    address.street_address = addr_str or address.street_address
                    address.city = city_str or address.city
                    address.save()
                else:
                    Address.objects.create(
                        user=user,
                        street_address=addr_str or 'Sin dirección',
                        city=city_str or 'Sin ciudad',
                        state='N/A',
                        zip_code='0000000'
                    )
            return JsonResponse({'success': True, 'mensaje': 'Datos guardados'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Método no permitido'}, status=405)


@csrf_exempt
def get_user_orders(request):
    email = request.GET.get('email')
    if not email:
        return JsonResponse([], safe=False)
    
    orders = Order.objects.filter(user__email=email).order_by('-created_at')
    data = []
    
    expiration_threshold = timezone.now() - timedelta(hours=6)

    for o in orders:
        is_pending = o.status == Order.StatusChoices.PENDING
        is_expired = is_pending and o.created_at < expiration_threshold

        data.append({
            'id': o.id,
            'order_number': f"POLI-{o.id}",
            'status': o.get_status_display(),
            'total': float(o.total_amount),
            'date': o.created_at.strftime("%d/%m/%Y"),
            'raw_status': o.status,
            'is_expired': is_expired
        })
    return JsonResponse(data, safe=False)


@csrf_exempt
def track_order(request):
    order_code = request.GET.get('code', '').upper().replace('POLI-', '')
    try:
        order = Order.objects.select_related('user', 'shipping_address').get(id=order_code)
        
        is_owner = False
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            from rest_framework_simplejwt.tokens import AccessToken
            try:
                token_string = auth_header.split(' ')[1]
                if token_string and token_string != 'null': # Protección extra contra tokens nulos
                    token = AccessToken(token_string)
                    user_id = token['user_id']
                    user = User.objects.get(id=user_id)
                    if user.email == order.user.email:
                        is_owner = True
            except Exception as e:
                pass 

        courier = "Pedido en preparación"
        tracking_number = "Pendiente de envío"
        
        if hasattr(order, 'shipment'):
            courier = order.shipment.courier or courier
            tracking_number = order.shipment.tracking_number or tracking_number

        items_list = []
        for item in order.items.all():
            items_list.append({
                'name': item.product.name,
                'quantity': item.quantity,
                'price': float(item.unit_price)
            })

        response_data = {
            'success': True,
            'id': order.id,
            'email': order.user.email,
            'order_number': f"POLI-{order.id}",
            'status': order.get_status_display(),
            'date': order.created_at.strftime("%d/%m/%Y"),
            'is_owner': is_owner,
            'items': items_list,
        }

        if is_owner:
            response_data.update({
                'customer_name': order.user.first_name or order.user.username,
                'address': f"{order.shipping_address.street_address}, {order.shipping_address.city}" if order.shipping_address else "No especificada",
                'courier': courier,
                'tracking_number': tracking_number,
                'total': float(order.total_amount),
                'raw_status': order.status,
                'is_expired': False 
            })

        return JsonResponse(response_data)
    except (Order.DoesNotExist, ValueError):
        return JsonResponse({'success': False, 'error': 'Pedido no encontrado'})
    
@csrf_exempt
def get_favorites(request):
    email = request.GET.get('email')
    if not email:
        return JsonResponse([], safe=False)
    
    favorites = Favorite.objects.filter(user__email=email).select_related('product')
    products_list = []
    
    for fav in favorites:
        product = fav.product
        main_image_obj = product.images.filter(is_main=True).first()
        if not main_image_obj:
            main_image_obj = product.images.first()
            
        image_url = main_image_obj.image.url if main_image_obj else None
        
        products_list.append({
            'id': product.id,
            'name': product.name,
            'price': float(product.price),
            'stock': product.stock,
            'category__name': product.category.name if product.category else "Sin categoría",
            'image': image_url,
        })

    return JsonResponse(products_list, safe=False)

@csrf_exempt
def toggle_favorite(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            product_id = data.get('product_id')
            
            if not email or not product_id:
                return JsonResponse({'error': 'Faltan datos'}, status=400)

            user = User.objects.get(email=email)
            product = Product.objects.get(id=product_id)
            
            fav, created = Favorite.objects.get_or_create(user=user, product=product)
            
            if not created:
                fav.delete()
                return JsonResponse({'status': 'removed'}, status=200)
                
            return JsonResponse({'status': 'added'}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Método no permitido'}, status=405)

@csrf_exempt
def submit_contact_message(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            nombre = data.get('nombre')
            email = data.get('email')
            asunto = data.get('asunto')
            mensaje = data.get('mensaje')

            if not all([nombre, email, asunto, mensaje]):
                return JsonResponse({'error': 'Todos los campos son obligatorios'}, status=400)

            ContactMessage.objects.create(
                name=nombre,
                email=email,
                subject=asunto,
                message=mensaje
            )
            return JsonResponse({'success': True, 'mensaje': 'Mensaje guardado con éxito'}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Método no permitido'}, status=405)