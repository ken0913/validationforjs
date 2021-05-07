# validationforjs

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
