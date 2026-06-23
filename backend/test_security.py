from app.core.security import hash_password, verify_password

hashed = hash_password("123456")

print("Hashed:", hashed)

print("Check correct:", verify_password("123456", hashed))
print("Check wrong:", verify_password("wrongpass", hashed))