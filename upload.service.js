
// 服务器配置信息
const server = {
	host: 'xxxxx', // 服务器ip
	port: '22', // 端口一般默认22
	username: 'root', // 用户名
	password: 'xxxx', // 密码
	serverPath: '/www/wwwroot/panel.yongz.cloud/',  // 服务器路径（结尾加/）
	packageName: 'jenkins', // 上传到服务器的位置
	localPath:'./dist/' // 本地打包文件路径
}

// 引入scp2
import client from 'scp2';
import ora from 'ora';
const spinner = ora('正在发布到服务器...');

// 创建shell脚本
import {Client} from 'ssh2';
// const Client = require('ssh2').Client;
const conn = new Client();

console.log('正在建立连接');
conn.on('ready', function () {
	console.log('已连接')
	if(!server.packageName){
		console.log('连接已关闭');
		conn.end()
		return false;
	}
	// 这里我拼接了放置服务器资源目录的位置 ，首选通过rm -rf删除了这个目录下的文件
	conn.exec('rm -rf ' + server.serverPath + server.packageName + '/*', function (err, stream) {
		console.log('删除文件');
		stream.on('close', function (code, signal) {
			console.log('开始上传')
			spinner.start();
			client.scp(server.localPath, {
				"host": server.host,
				"port": server.port,
				"username": server.username,
				"password": server.password,
				"path": server.serverPath + server.packageName
			}, err => {
				spinner.stop();
				if (!err) {
					console.log('项目发布完毕');
				} else {
					console.log("err", err);
				}
				conn.end(); // 结束命令
			})
		}).on('data', function (data) {
			console.log('STDOUT: ' + data);
		}).stderr.on('data', function (data) {
			console.log('STDERR: ' + data);
		});
	})
}).connect({
	host: server.host,
	port: server.port,
	username: server.username,
	password: server.password
// privateKey: '' // 使用密钥登录
})
