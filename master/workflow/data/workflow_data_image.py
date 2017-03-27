from master.workflow.data.workflow_data import WorkFlowData
from master import models
from common.utils import *

class WorkFlowDataImage(WorkFlowData) :
    """
    1. Definition
    handle preview and settings for image data
    2. Tables
    NN_WF_NODE_INFO (NODE_CONFIG_DATA : Json Field) 
    """

    def get_preview_data(self):
        """

        :param type:
        :param conn:
        :return:
        """
        return None


    def set_preview_data(self):
        """

        :param type:
        :param conn:
        :return:
        """
        return None


    def get_step_source(self, node_id):
        """
        getter for source step
        :return:obj(json) to make view
        """
        try:
            obj = models.NN_WF_NODE_INFO.objects.get(nn_wf_node_id=node_id)
            config_data = getattr(obj, 'node_config_data')

        except Exception as e:
            raise Exception(e)
        return config_data

    def put_step_source(self, nnid, wfver, node, config_data):
        """
        putter for source step
        :param obj: config data from view
        :return:boolean
        """

        try:
            obj = models.NN_WF_NODE_INFO.objects.get(wf_state_id=str(nnid) + "_" + str(wfver), nn_wf_node_name=node)
            old_config_data = getattr(obj, 'node_config_data')
            if('labels' in old_config_data) :
                config_data["labels"] = old_config_data["labels"]
            setattr(obj, 'node_config_data', config_data)
            obj.save()
            return config_data

        except Exception as e:
            raise Exception(e)

    def get_step_preprocess(self):
        """
        getter for preprocess
        :return:obj(json) to make view
        """
        return None

    def put_step_preprocess(self, obj):
        """
        putter for preprocess
        :param obj: config data from view
        :return:boolean
        """
        return None

    def get_step_store(self):
        """
        getter for store
        :return:obj(json) to make view
        """
        return None

    def put_step_store(self, obj):
        """
        putter for store
        :param obj: config data from view
        :return:boolean
        """
        return None

    def _get_lable_list(self):
        """

        :return:
        """
        return []

    def _get_preview_urls(self):
        """

        :return:
        """
        return []


    def _insert_preview_images(self):
        """

        :return:
        """
        return None

    def _set_preivew_paths(self, preview_path_list):
        """

        :param preview_path_list:
        :return:
        """
        return None

    def _set_lable_list(self, lable_list):
        """

        :param lable_list:
        :return:
        """
        return None
