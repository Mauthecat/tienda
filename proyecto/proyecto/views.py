from django.http import JsonResponse

def api_home(request):
    return JsonResponse({"mensaje": "¡Conexión Exitosa con Django & MariaDB!"})