from app.core.security import hash_password, verify_password

def test_hash_password_creates_different_output_than_plain():
    hashed = hash_password("123456")
    assert hashed != "123456"

def test_verify_password_correct():
    hashed = hash_password("123456")
    assert verify_password("123456", hashed) is True

def test_verify_password_incorrect():
    hashed = hash_password("123456")
    assert verify_password("wrongpass", hashed) is False
