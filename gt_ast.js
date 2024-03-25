// 案例: 对极验 3 的点选验证码进行处理 --- 解混淆 ( 来自 mihayo 通行证 的登录页面, 是图标点选验证码)
const fs = require('fs');  // 引入fs模块, 用于读取文件
const parser = require('@babel/parser'); // 引入babel的parser, 用于将js代码转换为AST
const traverse = require('@babel/traverse').default; // 引入babel的traverse, 用于遍历AST
const t = require('@babel/types'); // 引入babel的types, 用于判断节点类型
const generate = require('@babel/generator').default; // 引入babel的generator, 用于将AST转换为js代码

//////// 只要上述导入不出错,就算安装成功了 ////////
input_file = './g3word.js'
output_file = './test6.js'


// 1. 读取文件
const jscode = fs.readFileSync(path=input_file, options={
    encoding: 'utf-8'
});

ast = parser.parse(jscode);


// 2. 对AST进行增删改查
// /////////////////////////////
// // 2.1 对 对象中的 { "****" : 所有类型的变量 }  中的 "****" 进行unicode编码的字符串进行处理
visitor_deunicode = {
    ObjectProperty(path){
        node = path.node;
        if (t.isStringLiteral(node.key)  ) { // && t.isCallExpression(node.value)
            if (node.key.extra && node.computed === false) {
                //// 方法 1 -- 通过替换的方式
                // raw_value = node.key.extra.rawValue;
                // raw = node.key.extra.raw;
                // // console.log(raw_value);
                // // console.log(raw);
                // raw_value = JSON.stringify(raw_value);
                // path.node.key.extra.raw = raw_value;

                // //// 方法 2 -- 通过删除的方式
                // path.node.key.extra = null;

                //// 方法 3 -- 通过删除 raw 的方式
                path.node.key.extra.raw = null;
            }
        }
    }
}

traverse(ast, visitor_deunicode); 


//////////////////////////////
// 先生成中间代码 --- 防止出现问题
// newcode = generate(ast, {jsescOption: { 
//         "minimal": true, 
//  },
//     comments: false, 
//     compact: true   ,  
// }).code
// ast = parser.parse(newcode);
// /////////////////////////////

// /////////////////////////////
// 2.2 解密函数还原和调用 (由于原文件的执行函数顺序不一样,我们需要加载开头的几个加解密函数)
// 加密和解密函数是 js 文件中调用比较多的函数, 一般都是在文件的开头定义的, 或者在函数的开头调用

// // 2.2.1 取前5 个函数,把这个五个函数分别取出来,放到一个数组中,然后执行, 注意执行的顺序
let decrypt_funcs = [];
for (let i = 0; i < 5; i++) {
    // 生成 js 代码并压缩,不要注释
    member_js = generate(ast.program.body[i], {comments: false, compact: true}).code;
    decrypt_funcs.push(member_js)
}

exec_order = [4, 0, 1, 2, 3]; // 执行顺序
for (let i =0, len = exec_order.length; i < len; i++) {
    eval(decrypt_funcs[exec_order[i]]);
}





// 3.3 (这个嵌套比较深, 需要仔细处理,主要是条件多, 由于 js 文件是混淆过得,会变化,所以需要仔细处理)
// 从 js 文件中我们可以看到每个函数开头都具有如下格式
// var $_CFAFC = vjekb.$_CV //这个元素也被使用了
// , $_CFAEu = ['$_CFAIw'].concat($_CFAFC)
// , $_CFAGj = $_CFAEu[1];  // 这个被使用了
// $_CFAEu.shift();
// var $_CFAHw = $_CFAEu[0];  // 这个元素基本没有被调用过
// 因此可以提炼出一个规则, 从中提取出我们需要的函数
//  var AAAA = vjekb.$_CV    // vjekb.$_CV  这个函数就是一个加密函数, 这个函数不就是第三个的函数名吗?
//  , BBBB = ['$_CFAIw'].concat(AAAA) 
//  , CCCC = BBBB[1];  // 这个函数就是一个解密函数
//  分别找出 AAAA, BBBB, CCCC, 放到不同的数组中,进行替换操作

/////////1. 先通过 ast 找出第三个函数的名字
thirdFunction = ast.program.body[2];
objname = thirdFunction.expression.left.object.name
fname = thirdFunction.expression.left.property.name
funcname = objname + '.' + fname;

/////// 2. 通过 ast 找出第四个函数的名字-不需要对象名
forthFunction = ast.program.body[3];
forthname = forthFunction.expression.left.property.name
console.log('-------');
console.log('找到的第三个函数名为 objname: ', objname, ',方法名 fname: ', fname);
console.log('找到的第四个方法名为 forthname: ', forthname);


////// 3. 通过 ast 找出 AAAA, BBBB, CCCC
AAAA_list = []
BBBB_list = []
CCCC_list = []
const visitor_findfuncname = {
    VariableDeclaration(path){
        // 他的下面有 一个 declarations 数组, 数组的每个元素是一个 VariableDeclarator,且长度为 3
        // 第一个元素: AAAA = Uaaco.$_Cy
        // 第二个元素: BBBB = ['$_CEAm'].concat(AAAA)
        // 第三个元素: CCCC = BBBB[1]
        // 找出 分别找出 AAAA, BBBB, CCCC, 放到不同的数组中
        if (path.node.declarations.length == 3) {
            AAAA = path.node.declarations[0];
            BBBB = path.node.declarations[1];
            CCCC = path.node.declarations[2];
            tiaojian0 = tiaojian1 = tiaojian2 = tiaojian3 = 0
            // AAAA BBBB CCCC 也都是 VariableDeclaration
            if(t.isVariableDeclarator(AAAA) && t.isVariableDeclarator(BBBB) && t.isVariableDeclarator(CCCC)) {
                // console.log(AAAA);
                // console.log(BBBB);
                // console.log(CCCC);
                tiaojian0 = 1;
            }


            if (t.isIdentifier(AAAA.id) && t.isMemberExpression(AAAA.init) && 
            t.isIdentifier(AAAA.init.object) && t.isIdentifier(AAAA.init.property) && 
            AAAA.init.object.name == objname && AAAA.init.property.name == fname) {
                // AAAA_list.push(AAAA.id.name);
                tiaojian1 = 1;
            }
            if (t.isIdentifier(BBBB.id) && t.isCallExpression(BBBB.init) && 
            t.isMemberExpression(BBBB.init.callee) && t.isArrayExpression(BBBB.init.callee.object) && 
            t.isStringLiteral(BBBB.init.callee.object.elements[0]) &&
            t.isIdentifier(BBBB.init.callee.property) && BBBB.init.callee.property.name == 'concat' &&
            t.isIdentifier(BBBB.init.arguments[0]) && BBBB.init.arguments[0].name == AAAA.id.name) {
                // BBBB_list.push(BBBB.id.name);
                tiaojian2 = 1;
            }
            if (t.isIdentifier(CCCC.id) && t.isMemberExpression(CCCC.init) && 
            t.isIdentifier(CCCC.init.object) && t.isNumericLiteral(CCCC.init.property) &&
            CCCC.init.object.name == BBBB.id.name && CCCC.init.property.value == 1) {
                // CCCC_list.push(CCCC.id.name);
                tiaojian3 = 1;
            }
            if(tiaojian1 === tiaojian2 && tiaojian2=== tiaojian3 && tiaojian1 === 1 && tiaojian3 === tiaojian0 ) {
                AAAA_list.push(AAAA.id.name);
                BBBB_list.push(BBBB.id.name);
                CCCC_list.push(CCCC.id.name);
                // console.log(AAAA_list);
                // console.log(BBBB_list);
                // console.log(CCCC_list);
                // path.stop();
            }
        }
    }
}

traverse(ast, visitor_findfuncname);
// 简单打印一下 三个数组的长度
console.log("数组 AAAA_list 的长度为: ", AAAA_list.length);
console.log("数组 BBBB_list 的长度为: ", BBBB_list.length);
console.log("数组 CCCC_list 的长度为: ", CCCC_list.length);



// 替换 AAAA_list
const visitor_replaceAAAAfuncvalue = {
    CallExpression(path){
        if (t.isIdentifier(path.node.callee) && AAAA_list.includes(path.node.callee.name) ) {
            // 并检查参数类型是否为 NumericLiteral
            if (t.isNumericLiteral(path.node.arguments[0])) {
                // 先执行调用的结果, 然后替换
                temp = eval(funcname)(path.node.arguments[0].value);
                // 替换节点
                path.replaceInline(t.valueToNode(temp));
            }
        }
    }
}
traverse(ast, visitor_replaceAAAAfuncvalue);
// 替换 BBBB_list  --- 其实这是一个过度变量,可以不用替换,主要是没有参与函数调用

//替换 CCCC_list
const visitor_replaceCCCCfuncvalue = {
    CallExpression(path){
        if (t.isIdentifier(path.node.callee) && CCCC_list.includes(path.node.callee.name) ) {
            // 并检查参数类型是否为 NumericLiteral
            if (t.isNumericLiteral(path.node.arguments[0])) {
                // 先执行调用的结果, 然后替换
                temp = eval(funcname)(path.node.arguments[0].value);
                // 替换节点
                path.replaceInline(t.valueToNode(temp));
            }
        }
    }
}

traverse(ast, visitor_replaceCCCCfuncvalue);


/////////  尝试移除上述代码(把下面这些代码都移除)
// var $_CFAFC = vjekb.$_CV //这个元素也被使用了
// , $_CFAEu = ['$_CFAIw'].concat($_CFAFC)
// , $_CFAGj = $_CFAEu[1];  // 这个被使用了
// $_CFAEu.shift();
// var $_CFAHw = $_CFAEu[0];  // 这个元素基本没有被调用过

///// 2.4 删除多余的代码 --删除之前先生成代码
// newcode = generate(ast, {jsescOption: { "minimal": true, }, comments: false,  compact: true}).code
// ast = parser.parse(newcode);

visitor_remove_var = {
    BlockStatement(path) {

        if (path.node.body.length < 3) {
            return;
        }
        tiaojian1 = tiaojian2 = tiaojian3 = 0;
        if (t.isVariableDeclaration(path.node.body[0]) && t.isExpressionStatement(path.node.body[1]) && t.isVariableDeclaration(path.node.body[2])) {
            
            if(t.isIdentifier(path.node.body[0].declarations[0].init.object) &&
            path.node.body[0].declarations[0].init.object.name == objname &&
            t.isIdentifier(path.node.body[0].declarations[0].init.property) &&
            path.node.body[0].declarations[0].init.property.name == fname) {
                tiaojian1 = 1;
            }
            
            if( t.isMemberExpression(path.node.body[1].expression.callee) &&
            path.node.body[1].expression.callee.property.name == 'shift') {
                tiaojian2 = 1;   
            }
            if (t.isIdentifier(path.node.body[2].declarations[0].init.object) &&
            path.node.body[2].declarations[0].init.property.value == 0){
                tiaojian3 = 1
            }
            if (tiaojian1 === tiaojian2 && tiaojian2 === tiaojian3 && tiaojian1 === 1) {
                // 删除该三个节点
                // console.log("----")
                path.node.body.splice(0, 3);
            }

        }
    }
}

traverse(ast, visitor_remove_var);


////// 重新生成代码 --- 感觉没有这个必要
// newcode = generate(ast, {jsescOption: { 
//     "minimal": true, 
// },
// comments: false, 
// compact: true   ,  
// }).code
// ast = parser.parse(newcode);

/// 2.5 删除多余的代码 , 比如 一个函数嵌套一个 for 循环, 比如:
// function a() {
//     var $_变量名A = 对象名.方法名()[数字][数字];  // 这个对象就是前面最开始的那个对象,  方法名对应第四个方法名
//     for (; $_变量名A !== 对象名.方法名()[数字][数字]; ) {
//         switch ($_变量名A) {
//             case 对象名.方法名()[数字][数字]:
//                 ...... case 1 的代码 .....
//                 $_变量名A = 对象名.方法名()[数字][数字];
//                 break;
//             ...
//             ...
//             ...
//             case 对象名.方法名()[数字][数字]:
//                 ...... case n 的代码 .....
//                 // 最后一个一般没有: $_变量名A = 对象名.方法名()[数字][数字];
//                 break;
//         }
//     }
// }
/////// 上述代码等价于
// function a() {
//     ...... case 1 的代码 .....
//     ...
//     ...
//     ...... case n 的代码 .....
// }
//////// 所以删除 以上多余的代码
visitor_remove2_case= {
    BlockStatement(path) {
        if (path.node.body.length == 2  &&
        t.isVariableDeclaration(path.node.body[0]) &&
        t.isForStatement(path.node.body[1]) &&
         t.isBlockStatement(path.node.body[1].body) &&
         t.isSwitchStatement(path.node.body[1].body.body[0]) &&
         t.isMemberExpression(path.node.body[0].declarations[0].init.object) && //.object.callee.object.name == "vjekb" 
         path.node.body[0].declarations[0].init.object.object.callee.object.name == objname && //XQJuY
        path.node.body[0].declarations[0].init.object.object.callee.property.name == forthname  //&&

        ) {
            // 通过这个条件 可以先删除部分代码,进行初步的尝试
            // path.node.body[0].declarations[0].init.object.property.extra.raw == '6'
            // path.node.body[0].declarations[0].init.property.extra.raw == '13' 
            ///////////////
            // 删除找出 case 下面的代码, 然后合并到一起, 然后替换整个 BlockStatement节点
            const switchStatement = path.node.body[1].body.body[0];
            // 遍历所有case语句
            switchStatement.cases.forEach(caseStatement => {
                // 删除break语句
                nn = caseStatement.consequent.length
                for (let i = 0; i < nn; i++) {
                    if (t.isBreakStatement(caseStatement.consequent[i])) {
                        caseStatement.consequent.splice(i, 1);
                    }
                    if (i >=1 && t.isExpressionStatement(caseStatement.consequent[i-1]) &&
                    t.isAssignmentExpression(caseStatement.consequent[i-1].expression) &&
                    t.isMemberExpression(caseStatement.consequent[i-1].expression.right.object) &&
                    caseStatement.consequent[i-1].expression.right.object.object.callee.object.name == objname &&
                    caseStatement.consequent[i-1].expression.right.object.object.callee.property.name == forthname 
                    ){
                        // 删除这个节点
                        caseStatement.consequent.splice(i-1, 1);
                    }
                    
                }
            });
            // 提取所有case语句的consequent
            const consequents = switchStatement.cases.reduce((acc, caseStatement) => {
                acc.push(...caseStatement.consequent);
                return acc;
            }, []);
            // 替换整个BlockStatement
            path.replaceWith(t.blockStatement(consequents));
            // console.log(consequents);
    }
}
}
traverse(ast, visitor_remove2_case);




newcode = generate(ast, {
    jsescOption: { "minimal": true}, 
    comments: false,  
    compact: false
}).code


// 4. 把新的代码写入文件
fs.writeFile(output_file, newcode, (err) => { 
    if (err) throw err; 
    console.log('数据已被追加到文件'); 
});

