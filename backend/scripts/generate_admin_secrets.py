"""Run: python scripts/generate_admin_secrets.py"""
from getpass import getpass
from secrets import token_urlsafe
from pwdlib import PasswordHash

password = getpass('Enter a strong admin password: ')
if len(password) < 12:
    raise SystemExit('Choose a password of at least 12 characters')
print('\nPaste these into backend/.env (never into frontend/.env):')
print('ADMIN_PASSWORD_HASH=' + PasswordHash.recommended().hash(password))
print('JWT_SECRET_KEY=' + token_urlsafe(48))
