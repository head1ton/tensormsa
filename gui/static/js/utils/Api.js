require('es6-promise').polyfill();
require('isomorphic-fetch');
 
import EnvConstants from './../constants/EnvConstants';
import SpinnerComponent from './../NNLayout/common/SpinnerComponent'
import React from 'react'
 import { render } from 'react-dom';


export default class Api {
    setLoading(flag){//this method for Loading from index ID=loadingSpinner
        let spinnerElement = React.createElement(SpinnerComponent, {
            flag : flag
        });
        if(flag == false){
            setTimeout(() => {
            render(spinnerElement, document.getElementById('loadingSpinner'));
            }, 1000);
        }else{
            render(spinnerElement, document.getElementById('loadingSpinner'));
        }
        
    }
  
    get (url, params) {
        console.log(EnvConstants.getApiServerUrl() + url);
        if(params != null && params === false){
            this.setLoading(false);
        }else{
            this.setLoading(true);
        }
        
        return fetch(
            EnvConstants.getApiServerUrl() + url ,
            {
                method: 'GET',
                mode: "cors",
                headers: new Headers({
                     'Accept': 'application/json',
                     'Content-type':'application/json'
                })
            }
        ).then(function(response) {
            return response.json();
        }).then(function(json) {
            return json;
        }).then().catch(function(e) {
            console.log("An Error has occurred" + e);
        });
    };

    post(url, params) {
        console.log(EnvConstants.getApiServerUrl());
        this.setLoading(true);
        return fetch(
            EnvConstants.getApiServerUrl() + url,
            {
                method: 'POST',
                mode: "cors",
                body: JSON.stringify(params),
                headers: new Headers({
                    'Accept': 'application/json',
                    'Content-type':'application/json'
                })
            }             
        ).then(function(response) {
            return response.json();
        }).then(function(json) {
            return json;
        }).then(this.setLoading(false)).catch(function(e) {
            console.log("An Error has occurred :" +e);
        });
    };

    postfiles(url, files) {
        console.log(EnvConstants.getApiServerUrl());
        this.setLoading(true);
        return fetch(
            EnvConstants.getApiServerUrl() + url,
            {
                method: 'POST',
                body: files
            }             
        ).then(function(response) {
            return response.json();
        }).then(function(json) {
            return json;
        });
    };

    put(url, params) {
        console.log(EnvConstants.getApiServerUrl()+ url);
        console.log(params);
        console.log(JSON.stringify(params));
        this.setLoading(true);
        return fetch(
            EnvConstants.getApiServerUrl() + url,
            {
                method: 'PUT',
                mode: "cors",
                body: JSON.stringify(params),
                headers: new Headers({
                    'Accept': 'application/json',
                    'Content-type':'application/json'
                })
            }
        ).then(function(response) {
            return response.json();
        }).then(function(json) {
            return json;
        }).then(this.setLoading(false)).catch(function() {
            console.log("An Error has occurred");
        });
    };

    delete(url, params) {
        console.log(EnvConstants.getApiServerUrl());
        this.setLoading(true);
        return fetch(
            EnvConstants.getApiServerUrl() + url,
            {
                method: 'DELETE',
                mode: "cors",
                body: JSON.stringify(params),
                headers: new Headers({
                    'Accept': 'application/json',
                    'Content-type':'application/json'
                })
            }
        ).then(function(response) {
            return response.json();
        }).then(function(json) {
            return json;
        }).then(this.setLoading(false)).catch(function() {
            console.log("An Error has occurred");
        });
    };

    getJson  (url, params) {
        return fetch(
            url,
            {
                method: 'POST',
                mode: "cors",
                body: JSON.stringify(params),
                headers: new Headers({
                    'Accept': 'application/json'
                })
            }
        ).then(function(response) {
            return response.json();
        }).then(function(json) {
            return json;
        }).catch(function(e) {
            console.log("An Error has occurred :" +e);
        });
    };
}