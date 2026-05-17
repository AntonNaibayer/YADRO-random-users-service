from src.people.models import Person


def test_person_can_be_created_from_external_api_data() -> None:
    external_data = {
        "Gender": "Женщина",
        "FirstName": "Анна",
        "LastName": "Иванова",
        "Phone": "+79991234567",
        "Email": "anna@example.com",
        "Address": "Москва",
        "ExtraField": "extra",
    }

    person = Person.from_external_api(external_data)

    assert person.gender == "Женщина"
    assert person.first_name == "Анна"
    assert person.last_name == "Иванова"
    assert person.phone == "+79991234567"
    assert person.email == "anna@example.com"
    assert person.address == "Москва"
    assert person.raw_data == external_data