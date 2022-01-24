const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const os = require('os');

//사진이 들어있는 폴더 이름을 str로 받음
const oldname = process.argv[2];
//현재 작업할 폴더의 절대경로를 저장
const workingDir = path.join(os.homedir(),'picture',oldname)
//폴더이름을 입력하지 않았거나 제대로된 경로가 아닌경우 알려주고 종료
if (!oldname || !fs.existsSync(workingDir)) {
    console.log('제대로 된 폴더명을 입력해주세요!')
    return
};

//조건을 만족하는 element들의 경로를 새로운 폴더 속으로 바꿔줌
function moveFile(workingDir,newname,element) {
    //상위경로와의 연결은 path.join으로 해결
    fsp.rename(path.join(workingDir,element),path.join(workingDir,newname,element))
    //경로 변경 후 바로 console에 변경사항 출력 (비동기여도 순서가 중요하지 않으므로 바로 출력)
    .then(() => console.log('move '+element+' to '+newname))
    .catch(console.error);
}

//제일먼저 폴더가 만들어져야하므로 동기적으로 폴더 먼저 생성
//폴더가 존재하는데 mkdir을 쓰면 에러가 남. 만들 폴더가 존재하는지 물어보고 만듬.
try{
    if (!fs.existsSync(path.join(workingDir,'video'))){
        fs.mkdirSync(path.join(workingDir,'video'));
    }
    if (!fs.existsSync(path.join(workingDir,'duplicated'))){
        fs.mkdirSync(path.join(workingDir,'duplicated'));
    }
    if (!fs.existsSync(path.join(workingDir,'captured'))){
        fs.mkdirSync(path.join(workingDir,'captured'));
    }
} catch (error) {
    console.error(error);
}

//해당폴더 안의 내용을 불러와서 하나씩 조건에 맞는지 점검
fsp.readdir(workingDir)
.then(data => {
    data.forEach(element => {
        //확장자 점검
        let ext = path.extname(element);
        if (ext === '.mp4' || ext === '.mov') {
            moveFile(workingDir,'video',element)
        }
        else if (ext === '.aae' || ext === '.png') {
            moveFile(workingDir,'captured',element)
        }
        else if (element.includes('E')){
            //E가 있는 파일의 원본을 옮겨야 하므로 E를 기준으로 split하고 E가 포함안된 뒤 부분과 'IMG_' 를 합침
            // EX) 'IMG_E1234' => saveFile=['IMG_E','1234'] => 'IMG_'+saveFile[1]='IMG_1234' 
            let saveFile = element.split('E')
            //혹시 편집된 파일만 있고 원본이 없는경우 에러를 방지하기 위해 원본 파일이 있나 확인하고 옮김
            if (data.includes('IMG_'+saveFile[1])){
                moveFile(workingDir,'duplicated',('IMG_'+saveFile[1]))
            }
        }
    });
} )
.catch(console.error);
