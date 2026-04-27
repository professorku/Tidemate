def ensure_cover_image(boat):
    cover = boat.images.filter(is_cover=True).order_by('sort_order', 'id').first()
    if cover:
        boat.images.exclude(id=cover.id).filter(is_cover=True).update(is_cover=False)
        return cover

    first_image = boat.images.order_by('sort_order', 'id').first()
    if first_image:
        boat.images.exclude(id=first_image.id).filter(is_cover=True).update(is_cover=False)
        first_image.is_cover = True
        first_image.save(update_fields=['is_cover'])
        return first_image

    return None


def sync_cover_image_field(boat):
    return ensure_cover_image(boat)


def set_cover_by_index(boat, cover_index, created_ids):
    if cover_index is None or not created_ids:
        return

    if cover_index >= len(created_ids):
        raise ValueError('Invalid cover image selection.')

    selected_id = created_ids[cover_index]

    boat.images.update(is_cover=False)
    boat.images.filter(id=selected_id).update(is_cover=True)

    ensure_cover_image(boat)


def set_cover_by_id(boat, cover_image_id):
    if cover_image_id is None:
        return

    image = boat.images.filter(id=cover_image_id).first()

    if not image:
        raise ValueError('Selected cover image was not found.')

    boat.images.update(is_cover=False)
    image.is_cover = True
    image.save(update_fields=['is_cover'])

    ensure_cover_image(boat)
