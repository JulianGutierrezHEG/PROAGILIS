from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed
from .serializers import UserSerializer
import jwt, datetime
from .models import User


class LoginView(APIView):
    def post(self, request):
        email = request.data['email']
        password = request.data['password']

        user = User.objects.filter(email=email).first()

        if user is None:
            raise AuthenticationFailed('Cet utilisateur n\'existe pas')
        
        if not user.check_password(password):
            raise AuthenticationFailed('Mot de passe incorrect')
        
        payload = {
            'id': user.id,
            'exp': datetime.datetime.now(tz=datetime.timezone.utc) + datetime.timedelta(minutes=60),
            'iat': datetime.datetime.now(tz=datetime.timezone.utc)
        }

        token = jwt.encode(payload, 'secret', algorithm='HS256')

        response = Response({
            'jwt': token,
            'role': user.role 
        })

        return response

class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            payload = {
                'id': user.id,
                'exp': datetime.datetime.now(tz=datetime.timezone.utc) + datetime.timedelta(minutes=60),
                'iat': datetime.datetime.now(tz=datetime.timezone.utc)
            }
            token = jwt.encode(payload, 'secret', algorithm='HS256')
            return Response({
                'jwt': token,
                'role': user.role
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    def post(self, request):
        response = Response()
        response.data = {
            'message': 'Déconnecté avec succès'
        }
        return response

class AuthenticatedUserView(APIView):
    def get(self, request):
        auth_header = request.headers.get('Authorization')
        if auth_header is None:
            raise AuthenticationFailed('Non authentifié')
        try:
            token = auth_header.split(' ')[1]
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
        except (IndexError, jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            raise AuthenticationFailed('Non authentifié')
        user = User.objects.filter(id=payload['id']).first()
        if user is None:
            raise AuthenticationFailed('Utilisateur non trouvé')
        serializer = UserSerializer(user)
        return Response(serializer.data)

