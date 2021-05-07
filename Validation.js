class Validation{
	/*
	* 合并数据
	*/
	_mergeData(data,rules){
		var result = [];
		for(var rule of rules){
			if(!rule.hasOwnProperty('label')){
				throw new Error("rules has not 'label' Attribute");
			}
			var tempRoute={
				label:rule.label,
				value:data[rule.label] || '',
				ruleValidate:rule.ruleValidate || [],
				custom:rule.custom || {},
				errors:[]
			};
			result.push(tempRoute);
		}
		return result;
	}
	/*
	* 取得规列表
	*/
	_getRuleList(ruleValidate){
		var result = [];
		for(var ruleStr of ruleValidate){
			var array = ruleStr.split("|");
			var temp = {
				ruleName:array[0],
				param:[],
			};
			if(array.length > 1){
				temp.param = this._getParam(array[1]);
			}
			result.push(temp);
		}
		return result;
	}
	_getParam(param){
		var paramArray = param.split(",");
		var result = {}
		for(var r of paramArray){
		  var key_value = r.split(":");
		  if(key_value.length == 2){
			result[key_value[0]] = key_value[1];
		  }
		}
		return result;
	}
	/*
	* 验证字段
	*/
	_validateValue(fromObject,ruleValidate,data){
		if(fromObject.custom.hasOwnProperty(ruleValidate.ruleName) && typeof(fromObject.custom[ruleValidate.ruleName]) == 'function' ){
			return fromObject.custom[ruleValidate.ruleName](fromObject,ruleValidate.param,data);
		}else{
			return eval(`this._${ruleValidate.ruleName}(fromObject,ruleValidate.param);`);
		}
	}
	
	/*
	* 验证方法 (对外接口)
	*/
	validate(data,rules){
		var hasError = false;
		var _from = this._mergeData(data,rules);
		for(var fromObject of _from){
			if(fromObject.ruleValidate.length>0){
				fromObject.ruleValidate = this._getRuleList(fromObject.ruleValidate);
				for(var ruleValidate of fromObject.ruleValidate){
					if(!this._validateValue(fromObject,ruleValidate,data))
					{
						hasError = true;
					}
				}
			}
		}
		return {
			hasError:hasError,
			from:_from
		};
	}
	
	/*
	* 去掉所有空格
	*/
    _trim(value){
		if(typeof(value) == 'number' || value === undefined){
			return value;
		}
		return value.replace(/\s+/g,"");
    }
	
	/*
	* 取得验证错误信息
	*/
	_getErrorMessage(defaultMsg,param){
		if(param && param.hasOwnProperty('message')){
			return param.message;
		}
		return defaultMsg;
	}
	
	/*
	* 必填项
	*/
	_required(data,param){
		var value = this._trim(data.value);
		if(value === "" || value == null || value == undefined){
		  data.errors.push(this._getErrorMessage(`${data.label}必须填写`,param));
		  return false;
		}
		return true;
	}
	
	/*
	* 是否为数字及数值范围
	* 'isNumber|min:2,max:10'
	*/
	_isNumber(data,param){
		var value = data.value;
		var re = /^(\+|-)?\d+($|\.\d+$)/;
		if(!re.test(value)){
			data.errors.push(this._getErrorMessage(`${data.label}必须是数字`,param));
			return false;
		}
		else if(param.hasOwnProperty('min') && value < param.min){
			data.errors.push(this._getErrorMessage(`${data.label}不能少于${param.min}`,param));
		}
		else if(param.hasOwnProperty('max') && value > param.max){
			data.errors.push(this._getErrorMessage(`${data.label}不能大于${param.max}`,param));
		}
		return true;
    }
	
	/*
	* 字符长度
	* 'length|min:2,max:10'
	*/
	_length(data,param){
		var value = data.value;
		if(param.hasOwnProperty('min') && value.length < param.min){
		  data.errors.push(this._getErrorMessage(`${data.label}长度不能少于${param.min}`,param));
		  return false;
		}
		else if(param.hasOwnProperty('max') && value.length > param.max){
		  data.errors.push(this._getErrorMessage(`${data.label}长度不能超过${param.max}`,param));
		  return false;
		}
		return true;
	}
	
	/*
	* 字符为空时默认值
	* 'default|str:abcdefg'
	*/
	_default(data,param){
		var value = this._trim(data.value);
		if(value === "" || value == null || value == undefined){
			if(param.hasOwnProperty('str')){
				data.value = param.str
			}
		}
		return true;
	}
	
	/*
	* 字符在填写范围内
	* 'in|str:abc/def/g'
	*/
	_in(data,param){
		var value = this._trim(data.value);
		if(param.hasOwnProperty('str')){
		  var string = param.str.split("/");
		  for(var key in string){
			  var str = string[key];
			  if(str == value){
				return true;
			  }
		  }
		}
		data.errors.push(this._getErrorMessage(`${data.label}不在填写范围内`,param));
		return false;
	}
	
	/*
	* 正则表达式
	* 'match|pattern:^[\u4e00-\u9fa5_0-9_a-z_A-Z*#\'\\-\(\)\. ]+$'
	*/
	_match(data,param){
		var value = data.value;
		if(param.hasOwnProperty('pattern')){
		  var pattern = new RegExp(param.pattern);
		  if(!pattern.test(data.value)){
			data.errors.push(this._getErrorMessage(`${data.label}不符合填写规范`,param));
			return false;
		  }
		}
		return true;
	}
}

//等待验证的表单
var data = {
	id:1,
	name:'ken',
	age:29,
	sex:1,
	email:"open@163.com",
	explain:'',
};

//验证规则
var rules = [ 
	{label:'id',ruleValidate:['required','isNumber']},
	{label:'name',ruleValidate:['required','length|min:2,max:10']},
	{label:'age',ruleValidate:['required','isNumber|max:10']},
	{label:'sex',ruleValidate:['required','in|str:1/2']},
	{label:'email',ruleValidate:['required','match|pattern:^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$']},
	{label:'explain',ruleValidate:['default|str:this is a boy!','length|max:500','myCustom'],custom:{
		myCustom:function (from,param,data){
			from.errors.push('测试代码');
			return false;
		};
	}},
];

//实例化验证类
var model = new Validation();
//对表单进行验证
var _from = model.validate(data,rules);

console.log(_from);

