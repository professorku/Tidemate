import logging

from django.db import DatabaseError, connection
from django.db.models import F, FloatField, Value
from django.db.models.expressions import Func
from django.db.models.functions import Cast

from .constants import POSTGIS_DISTANCE_ANNOTATION, POSTGIS_DISTANCE_ORDERING

logger = logging.getLogger(__name__)


class STMakePoint(Func):
    function = "ST_MakePoint"
    arity = 2


class STSetSRID(Func):
    function = "ST_SetSRID"
    arity = 2


class STTransform(Func):
    function = "ST_Transform"
    arity = 2


class STDistanceSphere(Func):
    function = "ST_DistanceSphere"
    arity = 2
    output_field = FloatField()


class STDWithin(Func):
    function = "ST_DWithin"
    arity = 3


def postgis_is_available():
    if connection.vendor != "postgresql":
        return False

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'postgis')"
            )
            row = cursor.fetchone()
            return bool(row and row[0])
    except DatabaseError as exc:
        logger.warning("PostGIS availability check failed: %s", exc)
        return False


def build_postgis_point(longitude_expression, latitude_expression):
    point = STMakePoint(longitude_expression, latitude_expression)
    return STSetSRID(point, Value(4326))


def apply_postgis_radius_filter(queryset, center_lat, center_lng, radius_km, page_size=None):
    center_point = build_postgis_point(Value(center_lng), Value(center_lat))
    row_point = build_postgis_point(
        Cast(F("longitude"), FloatField()),
        Cast(F("latitude"), FloatField()),
    )

    queryset = queryset.filter(latitude__isnull=False, longitude__isnull=False)
    queryset = queryset.annotate(
        **{
            POSTGIS_DISTANCE_ANNOTATION: STDistanceSphere(row_point, center_point),
        }
    ).filter(
        STDWithin(
            STTransform(row_point, Value(3857)),
            STTransform(center_point, Value(3857)),
            Value(radius_km * 1000),
        )
    ).order_by(*POSTGIS_DISTANCE_ORDERING)

    return queryset
