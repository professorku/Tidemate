def create_favorite(*, serializer, user):
    return serializer.save(user=user)
