var pg = require('pg');

// ���ݿ�����
var config = {
	user:"postgres",
	database:"ghost",
	password:"123456",
	port:5432,
	
	// ��չ����
	max:20, // ���ӳ����������
	idleTimeoutMillis:30000, // ����������ʱ�� 3s
}

// �������ӳ�
var pool = new pg.Pool(config);

// ��ѯ
pool.connect(function(err, client, done) {
  if(err) {
    return console.error('���ݿ����ӳ���', err);
  }
  // ������� Hello World
  client.query('SELECT $1::varchar AS OUT', ["Hello World"], function(err, result) {
    done();// �ͷ����ӣ����䷵�ظ����ӳأ�
	if(err) {
      return console.error('��ѯ����', err);
    }
    console.log(result.rows[0].out); //output: Hello World
  });
});

// Promise ��ʽ
pool.connect().then(client=>{
	client.query('SELECT $1::varchar AS OUT', ['Hello World By Promise']).then(res=>{
		client.release()
		console.log(res.rows[0].out)
	}).catch(e => {
		client.release()
		console.error('query error', e.message, e.stack)
	})
})

// Async & Await ��ʽ���� node ^7.2.1������ʱʹ�� node --harmony-async-await index.js��
var query = async () => {
  // ͬ����������
  var connect = await pool.connect()
  try {
	// ͬ���ȴ����
	var res = await connect.query('SELECT $1::varchar AS OUT', ['Hello World By Async&Await'])
	console.log(res.rows[0].out)
  } finally {
	connect.release()
  }
}

// �첽�������ݿ⴦��
query().catch(e => console.error(e.message, e.stack));

// �ڱ�test�в��롢�޸ġ�ɾ�����ݣ��������ֶ� (name, age)
pool.connect().then(client=>{
	// insert ����
	client.query("INSERT INTO test(name, age) VALUES($1::varchar, $2::int)", ["xiaoming","20"]).then(res=>{
		console.log("Insert Success")
		// ���������ID���з���ֵ�ģ���res��
		return res;
	}).then(res=>{
		// ��ѯxiaoming
		return client.query("Select * FROM test WHERE name = $1", ["xiaoming"]);
	}).then(res=>{
		// �����������Ƿ����ɹ�
		console.log(res.rows[0])
	}).then(res=>{
		// update ���ݣ���age��Ϊ21
		return client.query("UPDATE test SET age=$1 WHERE name=$2", [21, "xiaoming"])
	}).then(res=>{
		// �ٲ�ѯһ��xiaoming
		return client.query("Select * FROM test WHERE name = $1", ["xiaoming"]);
	}).then(res=>{
		// �������������Ƿ��Ϊ��21
		console.log(res.rows[0])
	}).then(res=>{
		// ɾ������
		client.query("DELETE FROM test WHERE name=$1", ["xiaoming"])
	}).then(res=>{
		// ����ٲ�ѯһ��xiaoming
		res = client.query("Select * FROM test WHERE name = $1", ["xiaoming"]);
		// �ͷ�����
		client.release()
		return res
	}).then(res=>{
		// ����������û���� undefined
		console.log(res.rows[0])
	})
})

pool.on("error", function(err, client){
	console.log("error --> ", err)
})

pool.on('acquire', function (client) {
  console.log("acquire Event")
})

pool.on('connect', function () {
  console.log("connect Event")
})
