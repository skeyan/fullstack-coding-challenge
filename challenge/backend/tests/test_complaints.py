from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from complaint_app.models import UserProfile, Complaint
from datetime import date

class ComplaintEndpointTests(TestCase):
    def setUp(self):
        self.username = "jdoe"
        self.password = "doe-1"
        self.user = User.objects.create_user(
            username=self.username,
            password=self.password,
            first_name="John",
            last_name="Doe"
        )

        self.profile = UserProfile.objects.create(
            user=self.user,
            full_name="John Doe",
            district="1",
            borough="Manhattan"
        )

        self.complaints = [
            Complaint.objects.create(
                unique_key="open_with_date",
                account="NYCC01",
                opendate=date(2024, 1, 1),
                closedate=None,
                complaint_type="Noise",
                descriptor="Loud Music",
                borough="Manhattan"
            ),
            Complaint.objects.create(
                unique_key="closed_with_both_dates",
                account="NYCC01",
                opendate=date(2024, 1, 1),
                closedate=date(2024, 1, 15),
                complaint_type="Traffic",
                descriptor="Signal",
                borough="Manhattan"
            ),
            Complaint.objects.create(
                unique_key="no_dates",
                account="NYCC01",
                opendate=None,
                closedate=None,
                complaint_type="Other",
                descriptor="Test",
                borough="Manhattan"
            ),
            Complaint.objects.create(
                unique_key="closed_no_open_date",
                account="NYCC01",
                opendate=None,
                closedate=date(2024, 1, 20),
                complaint_type="Parks",
                descriptor="Maintenance",
                borough="Manhattan"
            ),
            Complaint.objects.create(
                unique_key="different_district",
                account="NYCC02",
                opendate=date(2024, 1, 1),
                closedate=None,
                complaint_type="Health",
                descriptor="Rats",
                borough="Manhattan"
            ),
        ]

        self.client = APIClient()
        response = self.client.post('/login/', {
            'username': self.username,
            'password': self.password
        }, format='json')
        self.token = response.data['token']
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token}')

    def test_get_all_complaints(self):
        with self.subTest("Fetching all complaints for a district"):
            response = self.client.get('/api/complaints/allComplaints/')

            self.assertEqual(response.status_code, status.HTTP_200_OK,
                "Request should succeed")

        with self.subTest("Verifying complaints are from correct district"):
            for complaint in response.data:
                self.assertEqual(complaint['account'], 'NYCC01',
                    "Each complaint should belong to the user's district")

        with self.subTest("Verifying district access restrictions"):
            complaint_keys = [c['unique_key'] for c in response.data]
            self.assertNotIn('different_district', complaint_keys,
                "Should not include complaints from other districts")

    def test_get_open_cases(self):
        with self.subTest("Fetching open cases"):
            response = self.client.get('/api/complaints/openCases/')

            self.assertEqual(response.status_code, status.HTTP_200_OK,
                "Request should succeed")
            self.assertEqual(len(response.data), 1,
                "Should only return one open case")

        with self.subTest("Verifying open case properties"):
            self.assertEqual(response.data[0]['unique_key'], 'open_with_date',
                "Should be the complaint with only open date")
            self.assertIsNotNone(response.data[0]['opendate'],
                "Open case should have an open date")
            self.assertIsNone(response.data[0]['closedate'],
                "Open case should not have a close date")

        with self.subTest("Verifying district access restrictions"):
            complaint_keys = [c['unique_key'] for c in response.data]
            self.assertNotIn('different_district', complaint_keys,
                "Should not include open cases from other districts")

    def test_get_closed_cases(self):
        with self.subTest("Fetching closed cases"):
            response = self.client.get('/api/complaints/closedCases/')

            self.assertEqual(response.status_code, status.HTTP_200_OK,
                "Request should succeed")
            self.assertEqual(len(response.data), 2,
                "Should return both cases with close dates")

        with self.subTest("Verifying closed case properties"):
            for complaint in response.data:
                self.assertIsNotNone(complaint['closedate'],
                    "Every closed case should have a close date")

        with self.subTest("Verifying district access restrictions"):
            complaint_keys = [c['unique_key'] for c in response.data]
            self.assertNotIn('different_district', complaint_keys,
                "Should not include closed cases from other districts")

    def test_unauthorized_access(self):
        client = APIClient()
        endpoints = [
            '/api/complaints/allComplaints/',
            '/api/complaints/openCases/',
            '/api/complaints/closedCases/'
        ]

        with self.subTest("Verifying all endpoints require authentication"):
            for endpoint in endpoints:
                response = client.get(endpoint)
                self.assertEqual(
                    response.status_code,
                    status.HTTP_401_UNAUTHORIZED,
                    f"Endpoint {endpoint} should require authentication"
                )

    def test_filter_edge_cases(self):
        with self.subTest("Open cases should only include complaints with open date and no close date"):
            response = self.client.get('/api/complaints/openCases/')
            open_keys = [c['unique_key'] for c in response.data]

            self.assertEqual(len(open_keys), 1,
                "Should have exactly one open case")
            self.assertIn('open_with_date', open_keys,
                "Open cases should include complaint with open date and no close date")
            self.assertNotIn('no_dates', open_keys,
                "Open cases should not include complaint with no dates")

        with self.subTest("Closed cases should include all complaints with close dates"):
            response = self.client.get('/api/complaints/closedCases/')
            closed_keys = [c['unique_key'] for c in response.data]

            self.assertEqual(len(closed_keys), 2,
                "Should have exactly two closed cases")
            self.assertIn('closed_with_both_dates', closed_keys,
                "Closed cases should include complaint with both dates")
            self.assertIn('closed_no_open_date', closed_keys,
                "Closed cases should include complaint with only close date")
            self.assertNotIn('no_dates', closed_keys,
                "Closed cases should not include complaint with no dates")

    def test_get_top_complaints(self):
        # Add more test complaints to ensure proper counting
        Complaint.objects.create(
            unique_key="noise_case_2",
            account="NYCC01",
            complaint_type="Noise",
            descriptor="Construction",
            borough="Manhattan"
        )
        Complaint.objects.create(
            unique_key="noise_case_3",
            account="NYCC01",
            complaint_type="Noise",
            descriptor="Party",
            borough="Manhattan"
        )
        Complaint.objects.create(
            unique_key="traffic_case_2",
            account="NYCC01",
            complaint_type="Traffic",
            descriptor="Parking",
            borough="Manhattan"
        )

        with self.subTest("Fetching top complaints"):
            response = self.client.get('/api/complaints/topComplaints/')

            self.assertEqual(response.status_code, status.HTTP_200_OK,
                "Request should succeed")
            self.assertEqual(len(response.data), 3,
                "Should return top 3 complaint types")

        with self.subTest("Verifying complaint counts"):
            # Should be 3 Noise, 2 Traffic, 1 each of Others/Parks
            counts = {item['complaint_type']: item['count'] for item in response.data}
            self.assertEqual(counts['Noise'], 3,
                "Noise complaints should be most frequent")
            self.assertEqual(counts['Traffic'], 2,
                "Traffic should be second most frequent")

        with self.subTest("Verifying order"):
            types = [item['complaint_type'] for item in response.data]
            self.assertEqual(types[0], 'Noise',
                "Most frequent complaint should be first")
            self.assertEqual(types[1], 'Traffic',
                "Second most frequent complaint should be second")

        with self.subTest("Verifying district isolation"):
            # Add complaint of same type to different district
            Complaint.objects.create(
                unique_key="noise_other_district",
                account="NYCC02",
                complaint_type="Noise",
                descriptor="Party",
                borough="Manhattan"
            )
            response = self.client.get('/api/complaints/topComplaints/')
            noise_count = next(item['count'] for item in response.data
                            if item['complaint_type'] == 'Noise')
            self.assertEqual(noise_count, 3,
                "Count should not include complaints from other districts")

    def test_get_constituent_complaints(self):
        constituent_complaints = [
            Complaint.objects.create(
                unique_key="constituent_complaint_1",
                account="NYCC02",
                council_dist="NYCC01",
                opendate=date(2024, 1, 1),
                complaint_type="Noise",
                descriptor="Loud Music",
                borough="Manhattan"
            ),
            Complaint.objects.create(
                unique_key="constituent_complaint_2",
                account="NYCC03",
                council_dist="NYCC01",
                opendate=date(2024, 1, 2),
                complaint_type="Traffic",
                descriptor="Signal",
                borough="Manhattan"
            )
        ]

        other_constituent_complaints = [
            Complaint.objects.create(
                unique_key="other_constituent_complaint",
                account="NYCC01",
                council_dist="NYCC02",
                opendate=date(2024, 1, 3),
                complaint_type="Noise",
                descriptor="Construction",
                borough="Manhattan"
            )
        ]

        with self.subTest("Fetching constituent complaints"):
            response = self.client.get('/api/complaints/constituentComplaints/')

            self.assertEqual(response.status_code, status.HTTP_200_OK,
                "Request should succeed")

            complaint_keys = [c['unique_key'] for c in response.data]

            self.assertIn('constituent_complaint_1', complaint_keys,
                "Should include complaints from constituents in user's district")
            self.assertIn('constituent_complaint_2', complaint_keys,
                "Should include all complaints from constituents in user's district")

            self.assertNotIn('other_constituent_complaint', complaint_keys,
                "Should not include complaints from constituents of other districts")

        with self.subTest("Verifying constituent district filtering"):
            for complaint in response.data:
                self.assertEqual(complaint['council_dist'], 'NYCC01',
                    "Each complaint should be from constituents in user's district")

        with self.subTest("Unauthorized access"):
            client = APIClient()
            response = client.get('/api/complaints/constituentComplaints/')
            self.assertEqual(
                response.status_code,
                status.HTTP_401_UNAUTHORIZED,
                "Endpoint should require authentication"
            )

    def test_constituent_complaints_district_formatting(self):
        user2 = User.objects.create_user(
            username="jsmith",
            password="smith-5",
            first_name="Jane",
            last_name="Smith"
        )

        profile2 = UserProfile.objects.create(
            user=user2,
            full_name="Jane Smith",
            district="5",
            borough="Manhattan"
        )

        client = APIClient()
        response = client.post('/login/', {
            'username': "jsmith",
            'password': "smith-5"
        }, format='json')
        client.credentials(HTTP_AUTHORIZATION=f'Token {response.data["token"]}')

        Complaint.objects.create(
            unique_key="single_digit_complaint",
            account="NYCC02",
            council_dist="NYCC05",
            opendate=date(2024, 1, 1),
            complaint_type="Noise",
            borough="Manhattan"
        )

        with self.subTest("Testing single-digit district formatting"):
            response = client.get('/api/complaints/constituentComplaints/')
            self.assertEqual(response.status_code, status.HTTP_200_OK,
                "Request should succeed")

            complaint_keys = [c['unique_key'] for c in response.data]
            self.assertIn('single_digit_complaint', complaint_keys,
                "Should handle single-digit district padding correctly")
