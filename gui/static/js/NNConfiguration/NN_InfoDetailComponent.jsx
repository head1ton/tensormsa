import React from 'react'
import ReportRepository from './../repositories/ReportRepository'
import Api from './../utils/Api'
import FileUploadComponent from './../NNLayout/common/FileUploadComponent'
import JsonConfComponent from './../NNLayout/common/JsonConfComponent'
import NN_InfoDetailStackBar from './../NNConfiguration/NN_InfoDetailStackBar'
import NN_InfoDetailLine from './../NNConfiguration/NN_InfoDetailLine'
import NN_InfoDetailBarLine from './../NNConfiguration/NN_InfoDetailBarLine'
import NN_InfoDetailMemoModal from './../NNConfiguration/NN_InfoDetailMemoModal';
import NN_InfoDetailPredictAPIModal from './../NNConfiguration/NN_InfoDetailPredictAPIModal';
import NN_InfoDetailAutomlTable from './../NNConfiguration/NN_InfoDetailAutomlTable'
import { Line, LineChart, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {Pie} from 'react-chartjs-2';
import Modal from 'react-modal';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.scss';
import EnvConstants from './../constants/EnvConstants';

export default class NN_InfoDetailComponent extends React.Component {
    constructor(props, context) {
        super(props);
        this.state = {
            tableData: null,
            NN_TableData: null,
            NN_TableGraph:null,
            NN_TableWFData: null,
            NN_TableWFDataAccLoss: null,
            NN_TableDataAuto:null,
            NN_TableNodeData: null,
            NN_TableNodeDataSort: null,
            NN_TableColArr1:[    {index:0,      id:"sel"                , name:"Sel"}
                                ,{index:1,      id:"nn_wf_ver_id"       , name:"Network Version"}
                                ,{index:2,      id:"active_flag"        , name:"Active"}
                                ,{index:3,      id:"train_batch_ver_id" , name:"Train Batch"}
                                ,{index:4,      id:"train_acc_info"     , name:"Train Batch Acc"}
                                ,{index:5,      id:"train_loss_info"    , name:"Train Batch Loss"}
                                ,{index:6,      id:"train_model_exists" , name:"Train Model"}
                                ,{index:7,      id:"pred_batch_ver_id"  , name:"Predict Batch"}
                                ,{index:8,      id:"pred_acc_info"      , name:"Predict Batch Acc"}
                                ,{index:9,      id:"pred_loss_info"     , name:"Predict Batch Loss"}
                                ,{index:10,     id:"pred_model_exists"  , name:"Predict Model"}
                                ,{index:11,     id:"nn_wf_ver_desc"     , name:"Memo"}
                                ,{index:12,     id:"train"              , name:"Train"}
                                ,{index:13,     id:"api"                , name:"API"}
                                ,{index:14,     id:"condition"          , name:"Status"}
                            ],
            NN_TableBTData: null,
            NN_TableColArr2:[    {index:0,      id:"nn_batch_ver_id",   name:"Batch Version"}
                                ,{index:1,      id:"eval_flag",         name:"Train Active"}
                                ,{index:2,      id:"active_flag",       name:"Predict Active"}
                                ,{index:3,      id:"acc_info",          name:"Batch Acc"}
                                ,{index:4,      id:"loss_info",         name:"Batch Loss"}
                                ,{index:5,      id:"true_cnt",          name:"True Count"}
                                ,{index:6,      id:"true_false_cnt",    name:"Total Count"}
                                ,{index:7,      id:"true_false_percent",name:"Total Percent"}
                                ,{index:8,      id:"model",             name:"Network Model"}
                            ],
            NN_TableColArr3:[],
            nn_id:null,
            nn_wf_ver_id:null,
            nn_batch_id:null,
            nn_title:null,
            nodeType:null,
            netType:null,
            isViewBatch:false,
            isViewFile:true,
            color:"black",
            acclossLineChartBTData:null,
            tBarChartBTData:null,
            pBarChartBTData:null,
            modalViewMenu : null,
            openModalFlag : false,
            modalViewMenuPredictAPI : null,
            openModalFlagPredictAPI : false,
            tabIndex : 1,
            tabIndexAT : 1,
            file_wf_ver_id : 'common',
            active_color : "#14c0f2",
            configEditFlag:"N",
            autoParam:null, //Single, Auto
            trainType:true, // true : auto, false : single
            batchImg :EnvConstants.getImgUrl()+"ico_menu05.png",
            memoImg : EnvConstants.getImgUrl()+"ico_menu06.png",
            runTitle : "Run",
            sourcecnt:0,
            trainUploadView:false,
            testUploadView:false
        };
        this.closeModal = this.closeModal.bind(this);
        this.closeModalPredictAPI = this.closeModalPredictAPI.bind(this);
    }
    /////////////////////////////////////////////////////////////////////////////////////////
    // Common Function
    /////////////////////////////////////////////////////////////////////////////////////////
    findColInfo(idxTable, idxType, idxName){// 테이블 컬럼의 인덱스를 넘겨 준다.
        let col = this.state.NN_TableColArr1
        if(idxTable == 2){
            col = this.state.NN_TableColArr2
        }else if(idxTable == 3){
            col = this.state.NN_TableColArr3
        }

        let fItem = ""
        if(idxType == "index"){
            fItem = col.find(data => { return data.index == idxName})
        }else if(idxType == "id"){
            fItem = col.find(data => { return data.id == idxName})
        }else if(idxType == "name"){
            fItem = col.find(data => { return data.name == idxName})
        }

        return fItem
    }
    /////////////////////////////////////////////////////////////////////////////////////////
    // Top Button Function
    /////////////////////////////////////////////////////////////////////////////////////////
    setBatchFlagYN(){
        let batch = this.refs.batch
        if(batch != undefined){
            for(let i in this.state.NN_TableBTData){
                let vatef = this.state.NN_TableBTData[i]["eval_flag"]
                let vataf = this.state.NN_TableBTData[i]["active_flag"]
                let vate = this.refs.batch.rows[i*1+1].children[this.findColInfo("2", "id", "eval_flag").index].children[0].children[0]
                let vata = this.refs.batch.rows[i*1+1].children[this.findColInfo("2", "id", "active_flag").index].children[0].children[0]
                vate.value = vatef
                vata.value = vataf
            }
        }
    }

    searchData(){
        this.getCommonNNInfoWF()
        
        // select box의 경우 강제 변경을 해주어야 한다.
        if(this.state.NN_TableWFData[0]["ver_no_data"] == undefined){
            for(let i in this.state.NN_TableWFData){
                let vatf = this.state.NN_TableWFData[i]["active_flag"]
                let vat = this.refs.master2.rows[i*1+1].children[this.findColInfo("1", "id", "active_flag").index].children[0].children[0]
                vat.value = vatf
            }
        }
        // this.setBatchFlagYN()
        
        if(this.refs.barline != undefined){
            this.refs.barline.getCommonNodeInfoView()
        }

        if(this.refs.automlTable != undefined){
            this.refs.automlTable.getCommonNodeInfoView()
        }

        if(this.refs.trainfilesrc != undefined){
            this.refs.trainfilesrc.getFileData()
            this.refs.trainfilestr.getFileData()
        }

        if(this.refs.evalfilesrc != undefined){
            this.refs.evalfilesrc.getFileData()
            this.refs.evalfilestr.getFileData()
        }
    }

    fileView(){
        if(this.state.isViewFile == true){
            this.setState({ isViewFile: false })
        }else{
            this.setState({ isViewFile: true })
        }
    }
    
    addVersion(){//Version New를 생성해준다.
        if(this.state.autoParam == "Auto"){//Auto       
            this.props.reportRepository.getFileUpload(this.state.nn_id, 'common', '', 'runcheck').then((tableData) => {//File Check
                if(tableData[0]['filecnt'] == 0){
                    alert( tableData[0]['type'] +" File does not exist." )
                }else{
                    this.props.reportRepository.getMoniteringInfo('run_check', this.state.nn_id, 'all', false).then((tableData) => {//Job Check
                        if(tableData.length == undefined || tableData.length == 0){
                            let re = confirm( "Do you run?" )
                            if(re == true){
                                this.props.reportRepository.postCommonNNInfoAuto(this.state.nn_id).then((tableData) => {//Run AutoML
                                }); 
                            }
                        }else{
                            alert( "Can not execute because a running job exists." )
                        }
                    }); 
                }
            });     
        }else{//Single
               // New Version Train
            let wfparam = {}
            wfparam["nn_def_list_info_nn_id"] = ""
            wfparam["nn_wf_ver_info"] = "single"
            wfparam["condition"] = "1"
            wfparam["active_flag"] = "N"

            // Make NN WF Node Info
            let nodeparam = {}
            nodeparam["type"] = this.state.netType
            
            this.props.reportRepository.getFileUpload(this.state.nn_id, 'common', '', 'runcheck').then((tableData) => {//File Check
                if(tableData[0]['filecnt'] == 0){
                    alert( tableData[0]['type'] +" File does not exist." )
                }else{
                    let re = confirm( "Do you create version?" )
                    if(re == true){
                        this.props.reportRepository.postCommonNNInfoWF(this.state.nn_id, wfparam).then((wf_ver_id) => {
                            //node create
                            this.props.reportRepository.postCommonNNInfoWFNode(this.state.nn_id, wf_ver_id, nodeparam).then((tableData) => {
                                //node config input
                                this.props.reportRepository.putCommonNNInfoWFNode(this.state.nn_id, wf_ver_id, '', nodeparam).then((tableData) => {
                                    this.searchData()
                                });

                            });
                        });
                        
                    }
                }
            });
        }
        
        

    }

    saveData(){//Save
        if(this.state.NN_TableWFData[0]["ver_no_data"] != undefined){
            alert("Create Version")
            return
        }
        this.props.reportRepository.getMoniteringInfo('run_check', this.state.nn_id, 'all', false).then((tableData) => {
            if(tableData.length == undefined || tableData.length == 0){
                //Version Active Flag Save Validation
                let wfparam = {}
                let vSaveFlag = "N" //한개라도 Y인 Version이 있어야 한다.
                let vbody = this.refs.master2.children[1].children
                for(let i=0 ; i < vbody.length; i++){
                    let col = vbody[i].children
                    let ver = col[this.findColInfo("1", "id", "nn_wf_ver_id").index].attributes.alt.value // version id key column
                    let active = col[this.findColInfo("1", "id", "active_flag").index].childNodes[0].childNodes[0].selectedOptions[0].value // Active column

                    if(active == "Y"){                    
                        wfparam["nn_wf_ver_id"] = ver
                        wfparam["nn_def_list_info_nn_id"] = ""
                        wfparam["nn_wf_ver_info"] = "init"
                        // wfparam["condition"] = ""
                        wfparam["active_flag"] = "Y"
                        // Version Active 변경.
                        vSaveFlag = "Y"
                    }
                }

                if(vSaveFlag == "N"){
                    alert( "Select a Active Version.") 
                    return
                }

                //batch Validation
                if(this.refs.batch != undefined){
                    let beSaveFlag = "N" //한개라도 Y인 batcch 있어야 한다.
                    let baSaveFlag = "N" //한개라도 Y인 batcch 있어야 한다.
                    let bbody = this.refs.batch.children[1].children
                    for(let i=0 ; i < bbody.length; i++){
                        let colbatchv = bbody[i].children
                        let e_flag = colbatchv[this.findColInfo("2", "id", "eval_flag").index].childNodes[0].childNodes[0].selectedOptions[0].value // Active column
                        let a_flag = colbatchv[this.findColInfo("2", "id", "active_flag").index].childNodes[0].childNodes[0].selectedOptions[0].value // Active column

                        if(e_flag == "Y"){
                            beSaveFlag = "Y"
                        }

                        if(a_flag == "Y"){
                            baSaveFlag = "Y"
                        }
                    }
                    if (beSaveFlag == "N"){
                        alert( "Select a Batch(Train Active).") 
                        return
                    }else if(baSaveFlag == "N"){
                        alert( "Select a Batch(Predict Active).") 
                        return
                    }
                }

                let re = confirm( "Do you Save?" )
                if(re == true){
                     this.props.reportRepository.putCommonNNInfoWF(this.state.nn_id, wfparam).then((tableData) => {
                        this.getCommonNNInfoWF(this.state.nn_id)
                    });

                    if(this.refs.batch != undefined){
                        let bbody = this.refs.batch.children[1].children
                        for(let i=0 ; i < bbody.length; i++){
                            let colbatch = bbody[i].children
                            wfparam["nn_batch_ver_id"] = colbatch[this.findColInfo("2", "id", "nn_batch_ver_id").index].attributes.alt.value // version id key column
                            wfparam["eval_flag"] = colbatch[this.findColInfo("2", "id", "eval_flag").index].childNodes[0].childNodes[0].selectedOptions[0].value // Active column
                            wfparam["active_flag"] = colbatch[this.findColInfo("2", "id", "active_flag").index].childNodes[0].childNodes[0].selectedOptions[0].value // Active column

                            if(wfparam["eval_flag"] == "Y" || wfparam["active_flag"] == "Y"){
                                this.props.reportRepository.putCommonNNInfoBatch(this.state.nn_id, this.state.nn_wf_ver_id, wfparam).then((tableData) => {
                                });
                            }
                        }
                    }
                    
                    //Single Config Save
                    if(this.state.configEditFlag == "Y"){
                        let conf = this.refs.netconfig
                        if(conf != undefined){
                            let params = conf.getConfigData()
                        
                            this.props.reportRepository.putCommonNNInfoWFNode(this.state.nn_id, this.state.nn_wf_ver_id, this.state.nodeType, params).then((tableData) => {

                            });
                        }
                    }
                }
            }else{
                    alert( "Can not execute because a running job exists." )
            }
        });
    }

    /////////////////////////////////////////////////////////////////////////////////////////
    // Search Function
    /////////////////////////////////////////////////////////////////////////////////////////
    componentDidMount() {
        this.getCommonNNInfoWF()
    }

    getCommonNNInfoWF() {
        if(this.state.nn_id == null || this.state.nn_id == "init"){//Version 정보 없이 메뉴가 선택 되면 아무것도 보여주지 않는다.
            this.setState({ nn_title: "Please, Check Network" })
        }else{
            this.props.reportRepository.getCommonNNInfo(this.state.nn_id).then((tableData) => {// Network Info
                this.state.netType = tableData['fields'][0]["dir"]

                let autokeys = Object.keys(tableData['fields'][0]["automl_runtime"])
                this.state.NN_TableData = tableData['fields'][0]
                this.state.NN_TableGraph = tableData['graph']

                this.state.nn_title = tableData['fields'][0]["nn_title"]+" ("+this.state.netType+" "+this.state.autoParam+" NetID : "+this.state.nn_id+")"
                
                this.props.reportRepository.getCommonNNInfoWF(this.state.nn_id).then((tableData) => {// Network Version Info
                    if(tableData.length == 0){
                        if(this.state.autoParam == "Auto"){
                            tableData.push({"ver_no_data":"Click the Run button to create a Version"})
                        }else{
                            tableData.push({"ver_no_data":"Click the Add Ver button to create a Version"})
                        }
                        
                    }
                    this.setState({ NN_TableWFData: tableData })
                    this.setBatchLineChartData(tableData)
                    let active_flag = "N"
                    for(let i in tableData){
                        if(tableData[i].active_flag == "Y"){//active version을 선택해준다.
                            active_flag = "Y"
                            this.clickSeletVersion(tableData[i].nn_wf_ver_id)  
                        }
                    }
                    if (active_flag == "N" && tableData.length > 0){
                        this.clickSeletVersion(tableData[0].nn_wf_ver_id)  
                    }
                });

                this.props.reportRepository.getCommonNNInfoAuto(this.state.netType).then((tableData) => {
                    this.setState({ NN_TableDataAuto: tableData })

                    let trainflag = false
                    let testflag = false
                    if(tableData[0]['fields']['train_file_path'] != ''){
                        trainflag = true
                    }

                    if(tableData[0]['fields']['eval_file_path'] != ''){
                        testflag = true
                    }

                    this.setState({trainUploadView: trainflag})
                    this.setState({testUploadView: testflag})
                });

                // this.getCommonNodeInfoView()

            });
        }   
    }

    getCommonBatchInfo(ver) {
        function pad(n, width) {
          n = n + '';
          return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
        }
        if(ver != undefined){
            this.props.reportRepository.getCommonNNInfoBatch(this.state.nn_id, ver).then((tableData) => {// Network Batch Info
                //Batch Sort ID를 만들어주어야 한다.nn000000001_1_1
                for(let i in tableData){
                    if(tableData[i]["nn_batch_ver_id"] != null){
                        let split1 = ""
                        let split2 = ""
                        let splitData = tableData[i]["nn_batch_ver_id"].split("_")
                        let split0 = splitData[0]
                        if(splitData[1] != null && isNaN(splitData[1]) == false){
                            split1 = pad(splitData[1], 10)
                            split0 += "_"+split1
                        }
                        if(splitData[2] != null && isNaN(splitData[2]) == false){
                            split2 = pad(splitData[2], 10)
                            split0 += "_"+split2
                        }
                        tableData[i]["nn_batch_ver_id_sort"] = split0
                    }
                    
                }
                this.setState({ NN_TableBTData: tableData })
                this.setBatchFlagYN()
            });
        }
    }

    getCommonNodeInfo(ver) {
        this.props.reportRepository.getCommonNNInfoWFNode(this.state.nn_id, ver, "all").then((tableData) => {// Network Node Info
            this.setState({ NN_TableNodeData: tableData })
            this.clickNodeConfig("netconf_node")// Node Default netconf 를 뿌려 준다.
        });
    }
    /////////////////////////////////////////////////////////////////////////////////////////
    // Version Table Action
    /////////////////////////////////////////////////////////////////////////////////////////  
    clickSeletVersion(selectedValue){//Version을 선택하면 새로 조회 한다.   
        let value = selectedValue
        if(value != undefined && value.target != undefined){
            value = selectedValue.target.attributes.alt.value   
        }
        this.clickChangeVersion(value)
    }

    clickChangeVersion(value){//Version 이 변경 되면 해당 버전을 Check 해주고 Batch Node를 새로 조회 한다.
        let table = this.refs.master2
        for(let i=1 ; i < table.rows.length ; i++){
            let key = table.rows[i].children[0].children.rd1
            if(key != undefined && key.alt == value){
                key.checked = true
            }
        }

        this.state.nodeType = null //Node Table의 Title을 없애준다.
        this.state.nn_wf_ver_id = value
        this.state.NN_TableNodeDataSort = null
        this.getCommonBatchInfo(value)// Batch를 조회해준다.
        this.getCommonNodeInfo(value)// Node 정보를 가져와 뿌려준다.Active version의 Node를 가져온다.
        
        this.setBatchBarChartData(value)//chart정보를 만들어 뿌려준다.

        //클릭된 Batch 번호를 가져와 Title표시를 해주주어야 한다.
        for(let i in this.state.NN_TableWFData){
            if(value == this.state.NN_TableWFData[i]["nn_wf_ver_id"]){
                this.state.nn_batch_id = this.state.NN_TableWFData[i]["train_batch_ver_id"]
                this.state.NN_TableWFDataAccLoss = this.state.NN_TableWFData[i]
                //active version만 수정할 수 있다.
                if(this.state.NN_TableWFData[i]["active_flag"] == "Y" ){// && this.state.autoParam == "Single"
                    this.state.configEditFlag = "Y"
                }else{
                    this.state.configEditFlag = "N"
                }
            }
            
        }
    }

    clickTrainVersion(selectedValue){//Version Train을 선택했을때 훈련을 하고 재 조회 해준다. ..
        let value = selectedValue
        if(value.target != undefined){
            value = selectedValue.target.attributes.alt.value
            // 기존에 실행 되고 있는 Train이 있으면 안돌게 해야 한다.
            this.props.reportRepository.getMoniteringInfo('run_check', this.state.nn_id, 'all', false).then((tableData) => {
                if(tableData.length == undefined || tableData.length == 0){
                    //학습을 해준다.
                    let re = confirm( "Do you Train?" )
                    if(re == true){
                        this.props.reportRepository.postTainRun(this.state.nn_id, value).then((tableData) => {
                        });
                    }
                }else{
                        alert( "Can not execute because a running job exists." )
                }
            });

            this.clickChangeVersion(value)
        }        
    }

    handleChangeSelWF(selectedValue){//Version Active가 Y가 되면 다른 Y를 N으로 변경해 준다
        let value = selectedValue.target.value //active select cell
        let table = this.refs.master2
        if(value != undefined && value == "Y"){// key, desc cell
            let changekey = selectedValue.target.attributes.name.value // 변경된 Cell 키값 
            for(let i=1 ; i < table.rows.length ; i++){
                let key = table.rows[i].children[this.findColInfo("1", "id", "nn_wf_ver_id").index].attributes.alt.value
                let changvalue = table.rows[i].children[this.findColInfo("1", "id", "active_flag").index].children[0].children[0]
                if(key != changekey){// Y로 변경한 Cell 이 아니라면 
                    changvalue.value = "N"//N으로 변경을 해준다.
                }
            }
        }
    }

    closeModal() { 
        this.setState({openModalFlag: false})
    }

    closeModalPredictAPI() { 
        this.setState({openModalFlagPredictAPI: false})
    }

    clickOpenModalMenu(selectedValue){
        let value = selectedValue
        if(value.target != undefined){
            value = selectedValue.target.attributes.alt.value
            this.setState({modalViewMenu : <NN_InfoDetailMemoModal closeModal={this.closeModal} 
                                                                nn_id={this.state.nn_id}
                                                                nn_wf_ver_id={value}/>})
            this.setState({openModalFlag: true})
        }
        
    }

    clickOpenModalPredictAPI(selectedValue){
        let value = selectedValue
        if(value.target != undefined){
            value = selectedValue.target.attributes.alt.value
            this.setState({modalViewMenuPredictAPI : <NN_InfoDetailPredictAPIModal closeModalPredictAPI={this.closeModalPredictAPI} 
                                                                nn_id={this.state.nn_id}
                                                                nn_wf_ver_id={value}
                                                                nn_net_type={this.state.netType}/>})
            this.setState({openModalFlagPredictAPI: true})
        }
        
    }

    /////////////////////////////////////////////////////////////////////////////////////////
    // Version Line Chart
    /////////////////////////////////////////////////////////////////////////////////////////
    setBatchLineChartData(data){
        this.state.acclossLineChartBTData = []

        for(let rows in data){
            let row = data[rows]
            let cTrainacc = 0
            let cTrainloss = 0
            let cPredacc = 0
            let cPredloss = 0   
            let ver = row["nn_wf_ver_id"]
            if(row["train_acc_info"] != null){
                cTrainacc=row["train_acc_info"].acc*1
            }
            if(row["train_loss_info"] != null){
                cTrainloss=row["train_loss_info"].loss*1
            }
            if(row["pred_acc_info"] != null){
                cPredacc=row["pred_acc_info"].acc*1
            }
            if(row["pred_loss_info"] != null){
                cPredloss=row["pred_loss_info"].loss*1
            }

            this.state.acclossLineChartBTData.push({name: ver, TrainAcc: cTrainacc, TrainLoss: cTrainloss, PredictAcc: cPredacc, PredictLoss: cPredloss})
            
        }
    }
    /////////////////////////////////////////////////////////////////////////////////////////
    // Version Batch Bar Chart
    /////////////////////////////////////////////////////////////////////////////////////////   
    setBatchBarChartData(ver){
        for(let i in this.state.NN_TableWFData){
            if(this.state.NN_TableWFData[i]["nn_wf_ver_id"] == ver){
                this.state.tBarChartBTData = this.state.NN_TableWFData[i]["t_result_info"]
                this.state.pBarChartBTData = this.state.NN_TableWFData[i]["p_result_info"]
            }
        }
    }
    /////////////////////////////////////////////////////////////////////////////////////////
    // Batch Table Action
    /////////////////////////////////////////////////////////////////////////////////////////  
    handleChangeSelBTE(selectedValue){//Batch Train Active가 Y가 되면 다른 Y를 N으로 변경해 준다.
        let value = selectedValue.target.value //active select cell
        let table = this.refs.batch
        if(value != undefined && value == "Y"){// key, desc cell
            let changekey = selectedValue.target.attributes.name.value // 변경된 Cell 키값 
            for(let i=1 ; i < table.rows.length ; i++){
                let key = table.rows[i].children[this.findColInfo("2", "id", "nn_batch_ver_id").index].attributes.alt.value
                let changvalue = table.rows[i].children[this.findColInfo("2", "id", "eval_flag").index].children[0].children[0]
                if(key != changekey){// Y로 변경한 Cell 이 아니라면 
                    changvalue.value = "N"//N으로 변경을 해준다.
                    // this.state.NN_TableBTData[i-1]['eval_flag'] = "N"
                }else{
                    // this.state.NN_TableBTData[i-1]['eval_flag'] = "Y"
                }
            }
        }
    }

    handleChangeSelBTA(selectedValue){//Batch Predict Active가 Y가 되면 다른 Y를 N으로 변경해 준다.
        let value = selectedValue.target.value //active select cell
        let table = this.refs.batch
        if(value != undefined && value == "Y"){// key, desc cell
            let changekey = selectedValue.target.attributes.name.value // 변경된 Cell 키값 
            for(let i=1 ; i < table.rows.length ; i++){
                let key = table.rows[i].children[this.findColInfo("2", "id", "nn_batch_ver_id").index].attributes.alt.value
                let changvalue = table.rows[i].children[this.findColInfo("2", "id", "active_flag").index].children[0].children[0]
                if(key != changekey){// Y로 변경한 Cell 이 아니라면 
                    changvalue.value = "N"//N으로 변경을 해준다.
                    // this.state.NN_TableBTData[i-1]['active_flag'] = "N"
                }else{
                    // this.state.NN_TableBTData[i-1]['active_flag'] = "Y"
                }
            }
        }
    }
    /////////////////////////////////////////////////////////////////////////////////////////
    // Node Table Action
    /////////////////////////////////////////////////////////////////////////////////////////  
    clickNodeConfig(selectedValue){//Node를 선택했을때 Config 리스트를 보여준다.
        let table = this.refs.netconf_info
        let value = selectedValue
        if(value.target != undefined){
            value = selectedValue.target.attributes.alt.value
        }else{
            value = selectedValue
        }

        this.state.nodeType = value

        let nodeData = this.state.NN_TableNodeData

        for(let i in nodeData){
            let nodename = nodeData[i]["fields"]["nn_wf_node_name"]
            let nodeconfig = {"0":nodeData[i]["fields"]["node_config_data"]}
            if(value == nodename){
                this.setState({ NN_TableNodeDataSort : nodeconfig })
            }
        }
    }

    networkSelectTab(value){
        // let tab = value.target.innerText
        value = value.tabIndex + 1
        this.setState({ tabIndex: value })
    }

    networkSelectTabAT(value){
        // let tab = value.target.innerText
        value = value.tabIndexAT + 1
        this.setState({ tabIndexAT: value })
    }

    render() {
        this.state.nn_id = this.props.nn_id
        this.state.autoParam = this.props.autoParam

        if(this.state.autoParam == "Single"){
            this.state.runTitle = "Add Ver"
            this.state.trainType = false
        }else{
            this.state.runTitle = "Run"
            this.state.trainType = true
        }
        /////////////////////////////////////////////////////////////////////////////////////////
        // Common Function
        /////////////////////////////////////////////////////////////////////////////////////////
        let k = 1
        
        function sortByKey(array, key) {// Data sort key
            return array.sort(function(a, b) {
                var x = a[key]; var y = b[key];
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });
        }

        function sortData(data, id){// Data sort
            let nnInfoNewList = [];
            if (data != null) {
                for (var i in data) {
                    nnInfoNewList[i] = data[i];
                }
            }

            nnInfoNewList = sortByKey(nnInfoNewList, id);
            return nnInfoNewList
        }
        
        function makeHeader(data){// Make header
            let headerData = []
            for(let i in data){
                headerData.push(<th key={k++} style={{"textAlign":"center"}} >{data[i].name}</th>)
            }
            let tableHeader = []; //make header
            tableHeader.push(<tr key={k++} >{headerData}</tr>)
            return tableHeader
        }

        /////////////////////////////////////////////////////////////////////////////////////////
        // Version Table Data Make
        /////////////////////////////////////////////////////////////////////////////////////////
        this.state.NN_TableWFData = sortData(this.state.NN_TableWFData, "nn_wf_ver_id")
        let tableHeader = makeHeader(this.state.NN_TableColArr1)

        //Network Select Data
        let tableData = []; // make tabledata
        let optionYN = []
        optionYN.push(<option key={k++} value={"Y"}>{"Y"}</option>)
        optionYN.push(<option key={k++} value={"N"}>{"N"}</option>)

        for(let rows in this.state.NN_TableWFData){
            let colData = [];
            let row = this.state.NN_TableWFData[rows]
            let trainacc = ""
            let trainloss = ""
            let predacc = ""
            let predloss = ""
            let status = ""
            let statusName = ""

            if(row["ver_no_data"] != undefined){
                colData.push(<td key={k++} style={{"textAlign":"center", "width":"100%", "fontWeight":"bold", "color":this.state.active_color}} 
                                colSpan ={this.state.NN_TableColArr1.length}> {row["ver_no_data"]} </td>)
                tableData.push(<tr key={k++}>{colData}</tr>)
                continue
            }

            if(row["train_acc_info"] != null){
                trainacc = row["train_acc_info"].acc[row["train_acc_info"].acc.length-1]
            }
            if(row["train_loss_info"] != null){
                trainloss = row["train_loss_info"].loss[row["train_loss_info"].loss.length-1]
            }
            if(row["pred_acc_info"] != null){
                predacc = row["pred_acc_info"].acc[row["pred_acc_info"].acc.length-1]
            }
            if(row["pred_loss_info"] != null){
                predloss = row["pred_loss_info"].loss[row["pred_loss_info"].loss.length-1]
            }

            if(row["active_flag"] == "Y"){
                this.state.color = this.state.active_color
            }else{
                this.state.color = "black"
            }

            if(row["condition"] == "1"){
                status = "state_alive"
                statusName = "Alive"
            }else if(row["condition"] == "2"){
                status = "state_action"
                statusName = "Action"
            }else if(row["condition"] == "3"){
                status = "state_close"
                statusName = "Close"
            }else{
                status = "state_error"
                statusName = "Error"
            }

            colData.push(<td key={k++} width="50" > < input type = "radio" name="rd1"
                                                                    alt = {row["nn_wf_ver_id"]} 
                                                                    onClick = {this.clickSeletVersion.bind(this)}
                                                                    style={{"textAlign":"center", "width":"100%"}} />  </td>)
            colData.push(<td key={k++} alt = {row["nn_wf_ver_id"]} 
                                        onChange = {this.clickSeletVersion.bind(this)} > {row["nn_wf_ver_id"]} </td>)
              
            colData.push(<td key={k++} width="80" >
                                        <div>
                                        <select ref={"sel"+k} onChange={this.handleChangeSelWF.bind(this)}
                                                alt = {row["nn_wf_ver_id"]} 
                                                onClick = {this.clickSeletVersion.bind(this)}
                                                id={k} 
                                                defaultValue={row["active_flag"]}
                                                name = {row["nn_wf_ver_id"]}
                                                style={{"color":this.state.color, "width":"100%", "fontWeight":"bold"}}
                                                rowSpan={1}>
                                           {optionYN}
                                        </select>
                                        </div>
                                    </td>)
            colData.push(<td key={k++} alt = {row["nn_wf_ver_id"]} 
                                        onClick = {this.clickSeletVersion.bind(this)} > {row["train_batch_ver_id"]} </td>)
            colData.push(<td key={k++} alt = {row["nn_wf_ver_id"]} 
                                        onClick = {this.clickSeletVersion.bind(this)} > {trainacc} </td>)
            colData.push(<td key={k++} alt = {row["nn_wf_ver_id"]} 
                                        onClick = {this.clickSeletVersion.bind(this)} > {trainloss} </td>)
            colData.push(<td key={k++} alt = {row["nn_wf_ver_id"]} 
                                        onClick = {this.clickSeletVersion.bind(this)} > {row["train_model_exists"]} </td>)
            colData.push(<td key={k++} alt = {row["nn_wf_ver_id"]} 
                                        onClick = {this.clickSeletVersion.bind(this)} > {row["pred_batch_ver_id"]} </td>)
            colData.push(<td key={k++} alt = {row["nn_wf_ver_id"]} 
                                        onClick = {this.clickSeletVersion.bind(this)} > {predacc} </td>)
            colData.push(<td key={k++} alt = {row["nn_wf_ver_id"]} 
                                        onClick = {this.clickSeletVersion.bind(this)} > {predloss} </td>)
            colData.push(<td key={k++} alt = {row["nn_wf_ver_id"]} 
                                        onClick = {this.clickSeletVersion.bind(this)} > {row["train_model_exists"]} </td>)
            colData.push(<td key={k++} > <img style ={{width:20, "cursor":"pointer"}} alt = {row["nn_wf_ver_id"]}
                                                onClick={this.clickOpenModalMenu.bind(this)} 
                                                src={this.state.memoImg} /></td>)
            colData.push(<td key={k++} width="50" > <button name="btn2"
                                                            alt = {row["nn_wf_ver_id"]} 
                                                            value = {"Train"}
                                                            onClick = {this.clickTrainVersion.bind(this)}
                                                            style={{"textAlign":"center", "width":"100%"}} >Train</button></td>)
            colData.push(<td key={k++} width="70" > <button name="btn3"
                                                            alt = {row["nn_wf_ver_id"]} 
                                                            value = {"Predict"}
                                                            onClick = {this.clickOpenModalPredictAPI.bind(this)}
                                                            style={{"textAlign":"center", "width":"100%"}} >Predict</button></td>)
            // colData.push(<td key={k++} width="50" > < input type = "button" name="btn2"
            //                                                         alt = {row["nn_wf_ver_id"]} 
            //                                                         value = {"Train"}
            //                                                         onClick = {this.clickTrainVersion.bind(this)}
            //                                                         style={{"textAlign":"center", "width":"100%"}} /></td>)
            colData.push(<td key={k++}   ><span className={status}  alt = {row["nn_wf_ver_id"]} 
                                        onClick = {this.clickSeletVersion.bind(this)} > {statusName} </span> </td>)
            tableData.push(<tr key={k++}>{colData}</tr>)
        }

        let wfInfoListTable = []
        wfInfoListTable.push(<thead ref='thead' key={k++} className="center">{tableHeader}</thead>)
        wfInfoListTable.push(<tbody ref='tbody' key={k++} className="center" >{tableData}</tbody>)

        /////////////////////////////////////////////////////////////////////////////////////////
        // File 파일이 없으면 가장 먼저 등록할 수 있게 화면에 표시해준다.
        /////////////////////////////////////////////////////////////////////////////////////////
        let fileDefaultIndex = 0
        if(this.props.nn_type != undefined && this.props.nn_type == "C" ){
            fileDefaultIndex = 2
        }

        // if(this.refs.trainfilesrc != undefined){
        //     this.refs.trainfilesrc.getFileData()
        //     this.refs.trainfilestr.getFileData()
        // }

        // if(this.refs.evalfilesrc != undefined){
        //     this.refs.evalfilesrc.getFileData()
        //     this.refs.evalfilestr.getFileData()
        // }


        /////////////////////////////////////////////////////////////////////////////////////////
        // Batch Table Data Make
        /////////////////////////////////////////////////////////////////////////////////////////
        this.state.NN_TableBTData = sortData(this.state.NN_TableBTData, "nn_batch_ver_id_sort")
        tableHeader = makeHeader(this.state.NN_TableColArr2)

        tableData = []
        for(let rows in this.state.NN_TableBTData){
            let colData = [];
            let row = this.state.NN_TableBTData[rows]
            let acc = ""
            let loss = ""
            
            if(row["acc_info"] != null){
                acc = row["acc_info"].acc[row["acc_info"].acc.length-1]
            }
            if(row["loss_info"] != null){
                loss = row["loss_info"].loss[row["loss_info"].loss.length-1]
            }

            if(row["eval_flag"] == "Y" || row["active_flag"] == "Y"){
                this.state.color = this.state.active_color
            }else{this.state.color = "black"}
            colData.push(<td key={k++} alt={row["nn_batch_ver_id"]} style={{"color":this.state.color, "fontWeight":"bold"}}> {row["nn_batch_ver_id"]} </td>)

            if(row["eval_flag"] == "Y"){
                this.state.color = this.state.active_color
            }else{this.state.color = "black"}
            colData.push(<td key={k++} width="120" >
                                        <div>
                                        <select ref={"sel"+k} onChange={this.handleChangeSelBTE.bind(this)}
                                                id={k} 
                                                alt={row["nn_batch_ver_id"]} 
                                                defaultValue={row["eval_flag"]}
                                                name = {row["nn_batch_ver_id"]}
                                                style={{"color":this.state.color, "width":"100%", "fontWeight":"bold"}}
                                                rowSpan={1}>
                                           {optionYN}
                                        </select>
                                        </div>
                                    </td>)

            if(row["active_flag"] == "Y"){
                this.state.color = this.state.active_color
            }else{this.state.color = "black"}
            colData.push(<td key={k++} width="120" >
                                        <div>
                                        <select ref={"sel"+k} onChange={this.handleChangeSelBTA.bind(this)}
                                                id={k} 
                                                alt={row["nn_batch_ver_id"]} 
                                                defaultValue={row["active_flag"]}
                                                name = {row["nn_batch_ver_id"]}
                                                style={{"color":this.state.color, "width":"100%", "fontWeight":"bold"}}
                                                rowSpan={1}>
                                           {optionYN}
                                        </select>
                                        </div>
                                    </td>)

            colData.push(<td key={k++} alt={row["nn_batch_ver_id"]} > {acc} </td>)

            colData.push(<td key={k++} alt={row["nn_batch_ver_id"]} > {loss} </td>)

            colData.push(<td key={k++} alt={row["nn_batch_ver_id"]} > {row["true_cnt"]} </td>)

            colData.push(<td key={k++} alt={row["nn_batch_ver_id"]} > {row["true_false_cnt"]} </td>)

            colData.push(<td key={k++} alt={row["nn_batch_ver_id"]} > {row["true_false_percent"]} % </td>)

            if(row["eval_flag"] == "Y" || row["active_flag"] == "Y"){
                this.state.color = this.state.active_color
            }else{this.state.color = "black"}
            colData.push(<td key={k++} alt={row["nn_batch_ver_id"]} style={{"color":this.state.color, "fontWeight":"bold"}}> {row["model"]} </td>)

            tableData.push(<tr key={k++}>{colData}</tr>)
        }

        let batchInfoListTable = []
        batchInfoListTable.push(<thead ref='thead' key={k++} className="center">{tableHeader}</thead>)
        batchInfoListTable.push(<tbody ref='tbody' key={k++} className="center" >{tableData}</tbody>)
        /////////////////////////////////////////////////////////////////////////////////////////
        // Node Table Data Make
        /////////////////////////////////////////////////////////////////////////////////////////
        let nodeData = null
        tableHeader = []
        tableData = []
        if(this.state.NN_TableNodeData != null){
            let node = {}
            for(let i in this.state.NN_TableNodeData){
                node[i] = this.state.NN_TableNodeData[i]["fields"]
            }
            
            nodeData = sortData(node, "nn_wf_node_name")

            this.state.NN_TableColArr3 = []
            for(let i=0; i < nodeData.length; i++){
                let nodejson = {"index":i, "id":"nn_wf_node_name","name":nodeData[i]["nn_wf_node_name"],"config":nodeData[i]["node_config_data"]}
                this.state.NN_TableColArr3.push(nodejson)
            }

            tableHeader = makeHeader(this.state.NN_TableColArr3)
            let colData = []

            for (let i=0 ;i < this.state.NN_TableColArr3.length ; i++){
                let config = Object.keys(this.state.NN_TableColArr3[i]["config"]).length
                if(config > 0){
                    config = "Y"
                }else{
                    config = "N"
                }

                if(config == "N"){
                    colData.push(<td key={k++} alt={this.state.NN_TableColArr3[i]["name"]} > {config} </td>)
                }else if(this.state.nodeType == this.state.NN_TableColArr3[i]["name"]){
                    colData.push(<td key={k++} alt={this.state.NN_TableColArr3[i]["name"]} 
                                     onClick = {this.clickNodeConfig.bind(this)}
                                     style={{"color":this.state.active_color, "fontWeight":"bold", "cursor":"pointer"}}> {config} </td>)
                }else{
                    colData.push(<td key={k++} alt={this.state.NN_TableColArr3[i]["name"]} 
                                     onClick = {this.clickNodeConfig.bind(this)}
                                     style={{"color":this.state.active_color, "cursor":"pointer"}}> {config} </td>)
                }
                
            }
            tableData.push(<tr key={k++}>{colData}</tr>)
        }

        let nodeInfoListTable = []
        nodeInfoListTable.push(<thead ref='thead' key={k++} className="center">{tableHeader}</thead>)
        nodeInfoListTable.push(<tbody ref='tbody' key={k++} className="center" >{tableData}</tbody>)

        return (  

            <section>
            <div className="container paddingT10">
                
                <div className="tblBtnArea">
                    <button type="button" className="addnew" style={{"marginRight":"5px"}} onClick={() => this.searchData()} >Search</button>
                    <button type="button" className="addnew" style={{"marginRight":"5px"}} onClick={() => this.addVersion() } >{this.state.runTitle}</button>
                    <button type="button" className="save" onClick={() => this.saveData()} >Save</button>
                </div>
                
                <h1> {this.state.nn_title} </h1>    
                <table style={{ "width":"100%" }} >
                    <tr><td>
                        <div style={{ "overflow":"auto", "height":160}}>      
                            <table className="table detail" ref= 'master2'  >
                                {wfInfoListTable}
                            </table>
                        </div>
                    </td></tr>
                </table>

                <Modal className="modal" overlayClassName="modal" isOpen={this.state.openModalFlag}
                        onRequestClose={this.closeModal}
                        contentLabel="Modal" >
                    <div className="modal-dialog modal-lg">
                        {this.state.modalViewMenu}
                    </div>
                </Modal>    

                <Modal className="modal" overlayClassName="modal" isOpen={this.state.openModalFlagPredictAPI}
                        onRequestClose={this.closeModalPredictAPI}
                        contentLabel="Modal" >
                    <div className="modal-dialog modal-lg">
                        {this.state.modalViewMenuPredictAPI}
                    </div>
                </Modal>   

                <br/>
                <br/>
                {this.state.trainType ?
                <Tabs defaultIndex={fileDefaultIndex}  onSelect={tabIndexAT => this.networkSelectTabAT({ tabIndexAT })} >
                    <TabList>
                        <Tab>AutoMLChart</Tab>
                        <Tab>AutoMLTable</Tab>
                        <Tab>File</Tab>
                    </TabList>

                    <TabPanel>
                        <div>
                            <h2>Auto ML chart</h2>
                            <NN_InfoDetailBarLine ref="barline" nn_id={this.state.nn_id}  />
                        </div>
                    </TabPanel>
                    <TabPanel>
                        <div style={{ "overflow":"auto", "height":700}} >
                            <NN_InfoDetailAutomlTable ref="automlTable" nn_id={this.state.nn_id} NN_Auto={this.state.NN_TableData}      />
                        </div>
                    </TabPanel>
                    <TabPanel>
                        <div>
                            <table className="partition_half">
                                <tr>
                                {this.state.trainUploadView ?
                                    <td style={{"verticalAlign":"top"}}>
                                        <FileUploadComponent ref="trainfilesrc" 
                                                            title= "Network Train Source File Upload"
                                                            nn_id={this.state.nn_id} 
                                                            nn_wf_ver_id={this.state.file_wf_ver_id} 
                                                            nn_node_name={"netconf_data"} 
                                                            nn_path_type={"source"}
                                                            uploadbtnflag={true} 
                                                            deletebtnflag={true} />
                                    </td>
                                    :
                                    <td></td>
                                    }
                                {this.state.testUploadView ?
                                    <td style={{"verticalAlign":"top"}}>
                                        <FileUploadComponent ref="evalfilesrc" 
                                                            title= "Network Eval Source File Upload"
                                                            nn_id={this.state.nn_id} 
                                                            nn_wf_ver_id={this.state.file_wf_ver_id} 
                                                            nn_node_name={"eval_data"} 
                                                            nn_path_type={"source"}
                                                            uploadbtnflag={true} 
                                                            deletebtnflag={true} />
                                    </td>
                                    :
                                    <td></td>
                                    }
                                </tr>
                            </table>
                        </div>

                         <div>
                             <table className="partition_half">
                                <tr>
                                {this.state.trainUploadView ?
                                    <td style={{"verticalAlign":"top"}}>
                                        <FileUploadComponent ref="trainfilestr" 
                                                            title="Network Train Store File Upload"
                                                            nn_id={this.state.nn_id} 
                                                            nn_wf_ver_id={this.state.file_wf_ver_id} 
                                                            nn_node_name={"netconf_data"} 
                                                            nn_path_type={"store"} 
                                                            uploadbtnflag={false} 
                                                            deletebtnflag={true} />
                                    </td>
                                :
                                    <td></td>
                                    }
                                {this.state.testUploadView ?
                                    <td style={{"verticalAlign":"top"}}>
                                        <FileUploadComponent ref="evalfilestr" 
                                                            title="Network Eval Store File Upload"
                                                            nn_id={this.state.nn_id} 
                                                            nn_wf_ver_id={this.state.file_wf_ver_id} 
                                                            nn_node_name={"eval_data"} 
                                                            nn_path_type={"store"}
                                                            uploadbtnflag={false} 
                                                            deletebtnflag={true} />
                                    </td>
                                :
                                    <td></td>
                                    }
                                </tr>
                            </table>
                        </div>
                    </TabPanel>
                </Tabs>
                :
                    <div>
                            <table className="partition_half">
                                <tr>
                                {this.state.trainUploadView ?
                                    <td style={{"verticalAlign":"top"}}>
                                        <FileUploadComponent ref="trainfilesrc" 
                                                            title= "Network Train Source File Upload"
                                                            nn_id={this.state.nn_id} 
                                                            nn_wf_ver_id={this.state.file_wf_ver_id} 
                                                            nn_node_name={"netconf_data"} 
                                                            nn_path_type={"source"}
                                                            uploadbtnflag={true} 
                                                            deletebtnflag={true} />
                                    </td>
                                :
                                    <td></td>
                                    }
                                {this.state.testUploadView ?
                                    <td style={{"verticalAlign":"top"}}>
                                        <FileUploadComponent ref="evalfilesrc" 
                                                            title= "Network Eval Source File Upload"
                                                            nn_id={this.state.nn_id} 
                                                            nn_wf_ver_id={this.state.file_wf_ver_id} 
                                                            nn_node_name={"eval_data"} 
                                                            nn_path_type={"source"}
                                                            uploadbtnflag={true} 
                                                            deletebtnflag={true} />
                                    </td>
                                :
                                    <td></td>
                                    }
                                </tr>
                            </table>
        
                             <table className="partition_half">
                                <tr>
                                {this.state.trainUploadView ?
                                    <td style={{"verticalAlign":"top"}}>
                                        <FileUploadComponent ref="trainfilestr" 
                                                            title="Network Train Store File Upload"
                                                            nn_id={this.state.nn_id} 
                                                            nn_wf_ver_id={this.state.file_wf_ver_id} 
                                                            nn_node_name={"netconf_data"} 
                                                            nn_path_type={"store"} 
                                                            uploadbtnflag={false} 
                                                            deletebtnflag={true} />
                                    </td>
                                :
                                    <td></td>
                                    }
                                {this.state.testUploadView ?
                                    <td style={{"verticalAlign":"top"}}>
                                        <FileUploadComponent ref="evalfilestr" 
                                                            title="Network Eval Store File Upload"
                                                            nn_id={this.state.nn_id} 
                                                            nn_wf_ver_id={this.state.file_wf_ver_id} 
                                                            nn_node_name={"eval_data"} 
                                                            nn_path_type={"store"}
                                                            uploadbtnflag={false} 
                                                            deletebtnflag={true} />
                                    </td>
                                :
                                    <td></td>
                                    }
                                </tr>
                            </table>
                        </div>
                }
                <br/>

                <Tabs defaultIndex={0} onSelect={tabIndex => this.networkSelectTab({ tabIndex })} >
                    <TabList>
                      <Tab>Classification</Tab>
                      <Tab>Acc&Loss</Tab>
                      <Tab>BatchInfo</Tab>
                      <Tab>Config</Tab>                     
                    </TabList>

                    <TabPanel>
                        <div>
                            <h2> Train Label Classification chart (Batch : {this.state.nn_batch_id})</h2>
                            <NN_InfoDetailStackBar ref="stackbar" NN_Data={this.state.tBarChartBTData} />
                        </div>
                    </TabPanel>
                    <TabPanel>
                        <div>
                            <h2> Train Model Acc&Loss chart (Batch : {this.state.nn_batch_id})</h2>
                            <NN_InfoDetailLine ref="line" NN_Data={this.state.NN_TableWFDataAccLoss} />
                        </div>
                    </TabPanel> 
                    <TabPanel>
                        <div style={{ "overflow":"auto", "height":330}}>
                            <h2> Network Batch Info (Version : {this.state.nn_wf_ver_id}) </h2>
                            <table className="table detail" ref= 'batch' >
                                {batchInfoListTable}
                            </table>
                        </div>
                    </TabPanel> 
                    <TabPanel>
                        <div>
                            <h2> Network Node Info (Version : {this.state.nn_wf_ver_id}) </h2>
                            <table className="table detail" ref= 'netconf_info' >
                                {nodeInfoListTable}
                            </table>
                        </div>

                        <div>
                            <h2> Network Config ({this.state.nodeType}) </h2>
                            <JsonConfComponent ref="netconfig" 
                                                editable={this.state.configEditFlag} 
                                                NN_TableDataDetail={this.state.NN_TableNodeDataSort} />
                        </div>
                    </TabPanel> 
                    
                </Tabs>
                

                


            </div>
            </section>
        )
    }
}

NN_InfoDetailComponent.defaultProps = {
    reportRepository: new ReportRepository(new Api())
};

