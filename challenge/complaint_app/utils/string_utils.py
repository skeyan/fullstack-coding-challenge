def format_district_number(district_number):
    """
    Formats a district number into the standardized NYCC format.
    Adds extra padding as needed for single-digit numbers.
    Example: 1 -> "NYCC01", 12 -> "NYCC12"

    @param district_number - The district number to format

    @return str - The formatted district string in NYCC format
    """
    number = int(district_number)
    return f"NYCC{number:02d}"
