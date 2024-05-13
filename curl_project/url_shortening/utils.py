import hashlib
import uuid
import base64


def shorten_url1(url):
    # Generate a unique hash for the URL
    hash_object = hashlib.sha256(url.encode())
    hash_value = hash_object.hexdigest()

    # Convert the hash value to a shorter representation
    base62_chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    base62_value = ""
    decimal_value = int(hash_value, 16)

    while decimal_value > 0:
        remainder = decimal_value % 62
        base62_value = base62_chars[remainder] + base62_value
        decimal_value = decimal_value // 62

    return base62_value


def shorten_url(url):
     # Get the UUID from the URL model instance
    namespace_id = str(url.uuid)

    # Generate a unique UUID based on the URL model instance's UUID
    unique_id = str(uuid.uuid5(uuid.UUID(namespace_id), url.original_url))

    # Encode the UUID using Base64 encoding
    encoded_id = base64.urlsafe_b64encode(unique_id.encode()).decode()[:6]

    return encoded_id
