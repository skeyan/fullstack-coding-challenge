from django.test import TestCase
from complaint_app.utils.string_utils import format_district_number

class DistrictNumberFormattingTests(TestCase):
    def test_single_digit_district(self):
        """Test that single digit districts are zero-padded"""
        self.assertEqual(format_district_number(1), "NYCC01")
        self.assertEqual(format_district_number("1"), "NYCC01")
        self.assertEqual(format_district_number(9), "NYCC09")

    def test_double_digit_district(self):
        """Test that double digit districts are formatted correctly"""
        self.assertEqual(format_district_number(10), "NYCC10")
        self.assertEqual(format_district_number("51"), "NYCC51")
