import json
from rest_framework.response import Response
from rest_framework.views import APIView
from master.workflow.netconf.workflow_netconf_d2v import WorkFlowNetConfD2V as Doc2Vec
from common.utils import *

class WorkFlowNetConfD2V(APIView) :
    """

    """
    def post(self, request, nnid, ver, node):
        """
        - desc : insert data
        """
        try:
            input_data = request.data
            input_data['model_path'] = get_model_path(nnid, ver, node)
            nodeid = ''.join([nnid, '_', ver, '_', node])
            if(Doc2Vec().validation_check(input_data)) :
                return_data = Doc2Vec().set_view_obj(nodeid, input_data)
            else :
                return_data = {'message' : 'data validation error'}
            return Response(json.dumps(return_data))
        except Exception as e:
            return_data = {"status": "404", "result": str(e)}
            return Response(json.dumps(return_data))

    def get(self, request, nnid, ver, node):
        """
        - desc : get data
        """
        try:
            nodeid = ''.join([nnid, '_', ver , '_', node])
            return_data = Doc2Vec().get_view_obj(nodeid)
            return Response(json.dumps(return_data))
        except Exception as e:
            return_data = {"status": "404", "result": str(e)}
            return Response(json.dumps(return_data))

    def put(self, request, nnid, ver, node):
        """
        - desc ; update data
        """
        try:
            input_data = request.data
            input_data['model_path'] = get_model_path(nnid, ver, node)
            nodeid = ''.join([nnid, '_', ver, '_', node])
            if(Doc2Vec().validation_check(input_data)) :
                return_data = Doc2Vec().set_view_obj(nodeid, input_data)
            else :
                return_data = {'message' : 'data validation error'}
            return Response(json.dumps(return_data))
        except Exception as e:
            return_data = {"status": "404", "result": str(e)}
            return Response(json.dumps(return_data))

    def delete(self, request, nnid, ver, node):
        """
        - desc : delete  data
        """
        try:
            return_data = ""
            return Response(json.dumps(return_data))
        except Exception as e:
            return_data = {"status": "404", "result": str(e)}
            return Response(json.dumps(return_data))
