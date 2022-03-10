export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user',
        routes: [
          {
            name: 'login',
            path: '/user/login',
            component: './user/Login',
          },
        ],
      },
      {
        component: './404',
      },
    ],
  },
  {
    path: '/welcome',
    name: 'welcome',
    icon: 'smile',
    component: './Welcome',
  },
  {
    path: '/',
    redirect: '/welcome',
  },
  {
    path: '/charts',
    name: 'charts',
    icon: 'table',
    component: './Charts',
  },
  {
    path: '/take-photo',
    name: 'webrtc',
    icon: 'table',
    component: './TakePhoto',
  },
  {
    path: '/lucky',
    name: 'lucky',
    icon: 'table',
    component: './Game',
  },
  {
    component: './404',
  },
];
