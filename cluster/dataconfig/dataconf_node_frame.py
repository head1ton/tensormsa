from cluster.dataconfig.dataconf_node import DataConfNode
from master.workflow.dataconf.workflow_dataconf_frame import WorkflowDataConfFrame
from master.workflow.data.workflow_data_frame import WorkFlowDataFrame

import numpy as np
import tensorflow as tf
import pandas as pd

class DataConfNodeFrame(DataConfNode):
    """
        Data Columns을 설정 하고 Validation Check가 필요함
        그러나 매번 Training을 할때는 필요 없음

        Validation check
            Category는 몇개냐
            Continuous에 문자값이 있으면 안됨

    """

    def run(self, conf_data):
        try:
            self._init_node_parm(conf_data['node_id'])
            print("data_conf : " + str(self.data_conf))

            data_store_path = WorkFlowDataFrame(conf_data['nn_id'] + "_" + conf_data['wf_ver'] + "_" + "data_node").source_path
            data_conf = self.data_conf
            self.validate_data(data_store_path,data_conf )




            return None
        except Exception as e:
            raise Exception(e)

    def _init_node_parm(self):
        return None

    def _set_progress_state(self):
        return None

    def _init_node_parm(self, key):
        """
        Init parameter from workflow_data_frame
        :return:
        """
        wf_data_conf = WorkflowDataConfFrame(key)
        self.data_conf = wf_data_conf.data_conf

    def validate_data(self, path, configuration):

        df_csv_read = self.load_csv_by_pandas(path)
        result_valid_info = dict()

        #Distinct 값


        #Check Continous에 문자가 있는지.
        data_conf_json = configuration
        j_feature = data_conf_json["cell_feature"]

        df_numberic = df_csv_read._get_numeric_data().columns.values
        conf_numberic = list()
        numerics = ['int16', 'int32', 'int64', 'float16', 'float32', 'float64']
        for cn, c_value in j_feature.items():
            if c_value["column_type"] == "CONTINUOUS":
                conf_numberic.append(cn)

        compare_list_conf = list(set(conf_numberic) - set(df_numberic))
        compare_list_df = list(set(conf_numberic) - set(df_numberic))

        result_valid_info["Check Continous"] = str(compare_list_conf) + " " + str(compare_list_df)

        data_conf_json
        result_valid_info["DNN Mapping"] = "None"
        print(compare_list_conf + " " + compare_list_df)


        return result_valid_info

    def load_csv_by_pandas(self, data_path):
        """
        read csv
        :param data_path:
        :return:data_path
        """
        #TODO : readcsv는 util로는 필요 없는가?
        source_filepath_name = data_path + "/" + "adult.data"
        df_csv_read = pd.read_csv(tf.gfile.Open(source_filepath_name),
                                  skipinitialspace=True,
                                  engine="python")
        return df_csv_read

