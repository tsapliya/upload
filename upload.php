<?php
$max_size = 20971520000;
$dir = '/media/nas/nextcloudfiles/iglin/files/uploads/';
//$dir = '/Users/tsapliya/Desktop';
$errors = [
    '0' => 'ошибок нет',
    '1' => 'Размер принятого файла превысил максимально допустимый размер, который задан директивой upload_max_filesize конфигурационного файла php.ini.',
    '2' => 'Размер загружаемого файла превысил значение MAX_FILE_SIZE, указанное в HTML-форме',
    '3' => 'Загружаемый файл был получен только частично',
    '4' => 'Файл не был загружен',
    '6' => 'Отсутствует временная папка',
    '7' => 'Не удалось записать файл на диск',
    '8' => 'PHP-расширение остановило загрузку файла. PHP не предоставляет способа определить, какое расширение остановило загрузку файла; в этом может помочь просмотр списка загруженных расширений с помощью phpinfo()',
];
$blackList = ['php'];


if ( ! $_FILES )
{
    //echo 'erorr!данные не пришли';
   echo 'erorr!Пришедший массив пуст. Проверьте php.ini,`post_max_size` = ' . substr(ini_get('post_max_size'), 0, -1)*1 . 'mb';
}
else {


    foreach ($_FILES AS $new_file) {

        if( $_FILES['files0']['error'] != 0 ){
            echo 'erorr! ' . $errors[$new_file['error']];
        }
        elseif (in_array(get_ras($new_file['name']), $blackList)){
            echo 'erorr! файл: ' . $new_file['name'] . ' запрещен к загрузке';
        }
        elseif ($new_file['size'] < $max_size) {

            $file = $new_file["name"];

            $file = check_existing_file($dir, $file);

            if (is_uploaded_file($new_file["tmp_name"])) {

                move_uploaded_file($new_file["tmp_name"], $dir . $file);
                echo('файл загружен ');
                echo($dir . $file);

            } else {
                echo("erorr!Ошибка загрузки файла");
            }

        } else {
            echo('erorr!Файл: ' . $new_file['name'] . ' весит больше положенного ' . $max_size /1048576 . 'mb');
        }

    }


}

function check_existing_file($dir, $file){

    if (file_exists($dir . $file)) {
        if (substr($file, 0,1) == '(' && substr($file, 2,1) == ')'){
            $count = substr($file, 1,1) * 1 + 1;
            $file = substr($file, 3);
        }
        else{
            $count = 1;
        }
         $new_file = '(' . $count . ')' . $file;

        return check_existing_file($dir, $new_file);
    }

    return $file;

}

function get_ras($file)
{
    $cut=$file;
    $len=strlen($cut);
    $count=0;
    $ras='';
    while ( substr($cut,-1)!='.' && $len!=$count){
        $ras=substr($cut,-1) . $ras;
        $cut=substr($cut,0,-1);
        $count++;
    }
    if ($len==$count)
        return "";
    return $ras;
}
