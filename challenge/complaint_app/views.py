from rest_framework import viewsets
from .models import UserProfile, Complaint
from .serializers import UserSerializer, UserProfileSerializer, ComplaintSerializer
from rest_framework.response import Response
from rest_framework import status
# Create your views here.

class ComplaintViewSet(viewsets.ModelViewSet):
  http_method_names = ['get']
  serializer_class = ComplaintSerializer
  def list(self, request):
    # Get all complaints from the user's district
    try:
        user_profile = UserProfile.objects.get(user=request.user)

        district_number = user_profile.district
        padded_district = f"NYCC{int(district_number):02d}"

        complaints = Complaint.objects.filter(account=padded_district)

        serializer = self.serializer_class(complaints, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # Handle bad paths
    except UserProfile.DoesNotExist:
        return Response(
            {"error": "User profile not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

class OpenCasesViewSet(viewsets.ModelViewSet):
  http_method_names = ['get']
  serializer_class = ComplaintSerializer
  def list(self, request):
    # Get only the open complaints from the user's district
    try:
      user_profile = UserProfile.objects.get(user=request.user)

      district_number = user_profile.district
      padded_district = f"NYCC{int(district_number):02d}"

      openComplaintCases = Complaint.objects.filter(
        account=padded_district,
        opendate__isnull=False,
        closedate__isnull=True
      )

      serializer = self.serializer_class(openComplaintCases, many=True)
      return Response(serializer.data, status=status.HTTP_200_OK)

    # Handle bad paths
    except UserProfile.DoesNotExist:
        return Response(
            {"error": "User profile not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )



class ClosedCasesViewSet(viewsets.ModelViewSet):
  http_method_names = ['get']
  serializer_class = ComplaintSerializer
  def list(self, request):
    # Get only complaints that are closed from the user's district
    try:
      user_profile = UserProfile.objects.get(user=request.user)

      district_number = user_profile.district
      padded_district = f"NYCC{int(district_number):02d}"

      closedComplaintCases = Complaint.objects.filter(
        account=padded_district,
        closedate__isnull=False
      )

      serializer = self.serializer_class(closedComplaintCases, many=True)
      return Response(serializer.data, status=status.HTTP_200_OK)

    # Handle bad paths
    except UserProfile.DoesNotExist:
        return Response(
            {"error": "User profile not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

class TopComplaintTypeViewSet(viewsets.ModelViewSet):
  http_method_names = ['get']
  def list(self, request):
    # Get the top 3 complaint types from the user's district
    return Response()
