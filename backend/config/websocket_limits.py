WEBSOCKET_MAX_MESSAGE_BYTES = 8 * 1024
WEBSOCKET_CLOSE_MESSAGE_TOO_BIG = 1009


def websocket_payload_too_large(*, text_data=None, bytes_data=None):
    if text_data is not None:
        return len(text_data.encode('utf-8')) > WEBSOCKET_MAX_MESSAGE_BYTES

    if bytes_data is not None:
        return len(bytes_data) > WEBSOCKET_MAX_MESSAGE_BYTES

    return False