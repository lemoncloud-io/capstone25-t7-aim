import app from './app';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`🚀 Backend 서버가 포트 ${PORT}에서 실행 중입니다!`);
    console.log(`http://localhost:${PORT}`);
});
