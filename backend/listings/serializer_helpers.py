def build_serializer_context(view, base_context=None):
    context = base_context or {}
    context["request"] = view.request
    return context
