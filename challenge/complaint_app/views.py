from rest_framework import viewsets
from .models import UserProfile, Complaint
from .serializers import UserSerializer, UserProfileSerializer, ComplaintSerializer
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count

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

        # Check if we want constituent data
        is_constituent = request.query_params.get('constituent', '').lower() == 'true'
        filter_field = 'council_dist' if is_constituent else 'account'

        complaints = Complaint.objects.filter(**{filter_field: padded_district})

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

      # Check if we want constituent data
      is_constituent = request.query_params.get('constituent', '').lower() == 'true'
      filter_field = 'council_dist' if is_constituent else 'account'

      openComplaintCases = Complaint.objects.filter(**{
        filter_field: padded_district,
        'opendate__isnull': False,
        'closedate__isnull': True
      })

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

      # Check if we want constituent data
      is_constituent = request.query_params.get('constituent', '').lower() == 'true'
      filter_field = 'council_dist' if is_constituent else 'account'

      closedComplaintCases = Complaint.objects.filter(**{
        filter_field: padded_district,
        'closedate__isnull': False
      })

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
    try:
      user_profile = UserProfile.objects.get(user=request.user)
      district_number = user_profile.district
      padded_district = f"NYCC{int(district_number):02d}"

      # Check if we want constituent data
      is_constituent = request.query_params.get('constituent', '').lower() == 'true'
      filter_field = 'council_dist' if is_constituent else 'account'

      # Top 3 complaint case types
      topComplaintCaseTypes = (Complaint.objects
        .filter(**{filter_field: padded_district})
        .values('complaint_type')
        .annotate(count=Count('complaint_type'))
        .order_by('-count')
        .values('complaint_type', 'count')
        [:3]
      )

      return Response(list(topComplaintCaseTypes), status=status.HTTP_200_OK)

    # Handle bad paths
    except UserProfile.DoesNotExist:
        return Response(
            {"error": "User profile not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ConstituentComplaintsViewSet(viewsets.ModelViewSet):
  http_method_names = ['get']
  serializer_class = ComplaintSerializer
  def list(self, request):
      # Get all complaints from the user's district for only their constituents who live in their district
      try:
        user_district = self.request.user.userprofile.district

        # Add leading zero if needed)
        district_num = user_district if len(user_district) > 1 else f"0{user_district}"
        formatted_district = f"NYCC{district_num}"

        # Filter complaints by constituent's district (council_dist)
        complaintsByConstituents = Complaint.objects.filter(
            council_dist=formatted_district
        ).order_by('-opendate')

        serializer = self.serializer_class(complaintsByConstituents, many=True)
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
