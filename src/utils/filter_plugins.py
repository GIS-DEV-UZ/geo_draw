from flask import request

def register_filters(app):
    
    @app.template_filter('uri_validate')
    # @app.context_processor
    def uri_validate(req_arg):
        req_path = str(request.path)
        if req_path.rfind(req_arg) > 0:
            return True
        else:
            return False


    @app.template_filter('if_inline')
    def if_inline(cond:bool, first_val, sec_val):
        return first_val if cond else sec_val