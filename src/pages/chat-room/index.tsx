import { Form, Tabs, Input, Button } from 'antd';
import styles from './index.less';

const { TabPane } = Tabs;
const { TextArea } = Input;


export default function IndexPage() {

  const handleLocalMediaStreamError = () => {
    console.log('本地视频采集出错')
  };

  const getStatus = () => {

  };
  function callback(key: any) {
    console.log(key);
  }

  return (
    <div className={styles.app}>
      <div className={styles.info}>
        <Form
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
        >
          <Form.Item
            label="用户名"
            name="username"
          >
            <Input placeholder="请输入用户名!" />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
          >
            <Input.Password placeholder="请输入用户名!" />
          </Form.Item>
          <Button>加入聊天室</Button>
          <Button>离开聊天室</Button>
          <Button>开始采集本地视频</Button>
        </Form>
      </div>

      <div className={styles.scene}>
        <h1>在线聊天室</h1>
        <div className={styles.chat}>
          <Tabs defaultActiveKey="1" onChange={callback}>
            <TabPane tab="聊天" key="1">
              <div>
                <ul className="chat-message">
                  {[{ type: 'sys', msg: '666', username: 'sunday'  }].map((item, index) => (
                    <li key="index">
                      {item.type === 'sys' ? (
                        <div>
                          <span className='el-icon-bell' style={{ color: 'yellow' }} />
                          <span>{ item.msg }</span>
                        </div>
                      ) : (
                        <div>
                          <span>{item.username}</span>
                          <span>{item.msg}</span>
                        </div>
                      )}
                    </li>))}
                </ul>
                <TextArea />
                <Button>发送</Button>
              </div>
            </TabPane>
            <TabPane tab="用户" key="2">
              Content of Tab Pane 2
            </TabPane>
          </Tabs>
        </div>
      </div>

      <div className={styles.webRtc}>
        <div>
          <h4>本人</h4>
          <video autoPlay playsInline controls id='local-video' />
        </div>
      </div>

      <div>
        <h4>列表渲染</h4>
        <ul className={styles.others}>
          {[].map((item, index) => (
            <li key={index}>
              <h4>{item.other.username}
                <Button style={{ float: 'right' }}>结束互动</Button>
              </h4>
              <video
                autoPlay
                playsInline
                controls
                id="'remoteVideo'+item.other.userId"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
