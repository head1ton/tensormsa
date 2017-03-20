import json
from rest_framework.response import Response
from rest_framework.views import APIView
from master.workflow.netconf.workflow_netconf_renet import WorkFlowNetConfReNet

class WorkFlowNetConfRenet(APIView) :
    """

    """
    def post(self, request, nnid, ver, node):
        """
        - desc : insert data
        """
        try:
            return_data = ""
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
            return_data = WorkFlowNetConfReNet().get_view_obj(nodeid)
            return Response(json.dumps(return_data))
        except Exception as e:
            return_data = {"status": "404", "result": str(e)}
            return Response(json.dumps(return_data))

    def put(self, request, nnid, ver, node):
        """
        - desc ; update data
        """
        try:
            input_data = json.loads(str(request.body, 'utf-8'))
            if(WorkFlowNetConfReNet().validation_check(input_data)) :
                node_id = ''.join([nnid, '_', ver , '_', node])
                return_data = WorkFlowNetConfReNet().set_view_obj(node_id, input_data)
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