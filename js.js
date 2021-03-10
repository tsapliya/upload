//гитхаб

$('document').ready(function () {
    var form_data = new FormData();
    var max_size =  20971520000;
    var num_file = 0;
    var count_files = 0;
    var block_list = ['php'];
    var ajax_upl;



    var agent = window.navigator.userAgent.toLowerCase(),
        re = /iphone|ipod|ipad|android|windows phone os|kindle|silk|bb10|blackberry|mobile/i,
        wants_tab = re.exec(agent) ? true : false;

    if(wants_tab){
        $('#box').css('display', 'none');
        $('#inp_mob').css('display', 'block');
    }
    else{
        $('#box').css('display', 'block');
        $('#inp_mob').css('display', 'none');
    }

    /**
     * событие занесения файла через кнопку
     */
    $('#22').change(function () {

        var count = $(this).prop('files')['length'];
        var file_data;

        for (var i = 0; i < count; i++) {
            file_data = $(this).prop('files')[i];

            add_file(file_data);

        }
        $("#22")[0].value = "";
    });

    /**
     * Отправка на сервер
     */
    $('#upl').click(function () {
        $('.preview_div').css('display', 'none');
        $('#progressbar').css('display', 'block');
        ajax_upl = $.ajax({
            url: 'upload.php',
            dataType: 'text',
            cache: false,
            contentType: false,
            processData: false,
            data: form_data,
            type: 'post',
            xhr: function(){
                var xhr = $.ajaxSettings.xhr();
                xhr.upload.addEventListener('progress', function(evt){
                    if(evt.lengthComputable) {

                        var percentComplete = Math.ceil(evt.loaded / evt.total * 100);

                        $('#ready').css('width', percentComplete + '%');
                        $('#percent').html(percentComplete + '%');
                    }
                }, false);
                return xhr;
            },
            success: function (data) {

                if (data.substr(0, 6) === 'erorr!'){
                    $('.preview_div').css('display', 'block');
                    $('#progressbar').css('display', 'none');
                    alert(data.substr(6));
                }
                else {
                    $('#progressbar').css('display', 'none');
                    close_upload_info();
                }
            }
        });
    });

    /**
     * Если нет объекта Clipboard - создать
     */
    if (!window.Clipboard) {
        var pasteCatcher = document.createElement("div");

        pasteCatcher.setAttribute("contenteditable", "");

        pasteCatcher.style.display = "none";
        document.body.appendChild(pasteCatcher);

        pasteCatcher.focus();
        document.addEventListener("click", function() { pasteCatcher.focus(); });
    }
    /**
     * Удаление файла
     */
    $('.upload_info').on('click','.delete',function () {


        count_files--;

        if (count_files === 0){
            close_upload_info();
        }

        var id = $(this).attr('id');

        $('.pr' + id).slideUp(100, function(){
            $(this).closest('.pr' + id).remove();
        });


        form_data.delete('files' + id);

    });
    /**
     * событие Past
     */
    window.addEventListener("paste", pasteHandler);

    /**
     * функция обработки Past
     * @param e
     */
    function pasteHandler(e) {



        if (e.clipboardData) {
            var items = e.clipboardData.items;
            if (items) {
                for (var i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf("image") !== -1) {
                        var blob = items[i].getAsFile();
                        add_file(blob);
                    }
                }
            }
        } else {
            setTimeout(checkInput, 1);
        }

        $('#inp_mob').blur();

    }
    /**
     * обработка Past для moz
     */
    function checkInput() {
        var child = pasteCatcher.childNodes[0];
        add_file(child);
    }

    /**
     * Вывод превью файла
     * @param n_file - файл
     * @param id - его id
     */
    function render_preview(n_file, id) {
        $('.upload_info').append( '<div id="pr ' + id + '" class="preview_div pr' + id + '"><div class="delete" id="' + id + '">&#10006;</div> <div class="prev_img" id="preview' + id + '">&nbsp;</div> <div id="file-name' + id + '">&nbsp;</div> <div id="file-size'+ id + '">&nbsp;</div></div> ');
        count_files++;
        open_upload_info();
        try {
            var file = n_file;

            if (file) {
                var fileSize = 0;

                if (file.size > 1024 * 1024) {
                    fileSize = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
                }else {
                    fileSize = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';
                }
                if (file.name.length > 50){
                    document.getElementById('file-name' + id).innerHTML = 'Имя: ' + file.name.substr(0, 50) + '...';

                }
                else{
                    document.getElementById('file-name' + id).innerHTML = 'Имя: ' + file.name;
                }
                document.getElementById('file-name' + id).title = 'Имя: ' + file.name;
                document.getElementById('file-size' + id).innerHTML = 'Размер: ' + fileSize;

                if (/\.(jpe?g|bmp|gif|png)$/i.test(file.name)) {
                    var elPreview = document.getElementById('preview' + id);
                    elPreview.innerHTML = '';
                    var newImg = document.createElement('img');
                    newImg.className = "preview-img";

                    if (typeof file.getAsDataURL=='function') {
                        if (file.getAsDataURL().substr(0,11)=='data:image/') {
                            newImg.onload=function() {
                                document.getElementById('file-name' + id).innerHTML+=' ('+newImg.naturalWidth+'x'+newImg.naturalHeight+' px)';
                            }
                            newImg.setAttribute('src',file.getAsDataURL());
                            elPreview.appendChild(newImg);
                        }
                    }
                    else {
                        var reader = new FileReader();
                        reader.onloadend = function(evt) {
                            if (evt.target.readyState == FileReader.DONE) {
                                newImg.onload=function() {
                                    document.getElementById('file-name' + id).innerHTML+=' ('+newImg.naturalWidth+'x'+newImg.naturalHeight+' px)';
                                }

                                newImg.setAttribute('src', evt.target.result);
                                elPreview.appendChild(newImg);
                            }
                        };

                        var blob;
                        if (file.slice) {
                            blob = file.slice(0, file.size);
                        }else if (file.webkitSlice) {
                            blob = file.webkitSlice(0, file.size);
                        }else if (file.mozSlice) {
                            blob = file.mozSlice(0, file.size);
                        }

                        reader.readAsDataURL(blob);
                    }
                }
                else{
                    $('#preview' + id).html('<img class="file_pict" src="file.svg"><div class="file_ras">' + get_ras_file(file.name) + '</div>');
                }
            }
        }catch(e) {
            var file = document.getElementById('22').value;
            file = file.replace(/\\/g, "/").split('/').pop();
            document.getElementById('file-name' + id).innerHTML = 'Имя: ' + file;
        }

    }

    /**
     * функционал drag and drop
     * @type {*|jQuery|HTMLElement}
     */
    var dropZone = $('body');

    if (typeof(window.FileReader) == 'undefined') {
        dropZone.text('Не поддерживается браузером!');
        dropZone.addClass('error');
    }

    dropZone[0].ondragover = function() {
        $('#box').addClass('box-hover');
        $('#box').removeClass('box');
        return false;
    };

    // Убираем класс hover
    dropZone[0].ondragleave = function() {
        $('#box').removeClass('box-hover');
        $('#box').addClass('box');
        return false;
    };

    /**
     * Событие drop
     * @param event
     */
    dropZone[0].ondrop = function(event) {
        event.preventDefault();
        $('#box').removeClass('box-hover');
        $('#box').addClass('box');

        var count = event.dataTransfer.files.length;
        var file_data;

        for (var i = 0; i < count; i++) {

            file_data = event.dataTransfer.files[i];

            add_file(file_data);

        }


    }

    /**
     * Получение расширения файла
     * @param file
     * @returns {string}
     */
    function get_ras_file(file) {
        var cut = file;
        var len = cut.length;
        var count = 0;
        var ras = '';

        while ( cut.substr(-1) !== '.' && len !== count){

            ras = cut.substr(-1) + ras;
            cut = cut.substr(0, cut.length -1);
            count++;
        }
        if (len === count)
            return "";
        return ras;
    }

    function open_upload_info() {
        $('.upload_info').css({
            'margin-left': '0',
            'margin-right': '0',
            'width': '100%',
            'height': '40%',
            'background': '#fff',
            'padding': '10px'
        });
        $('.label').css('bottom', 'calc(50% + 60px)');
        setTimeout(function () {
            $('#upl').css('display', 'block');
        }, 400);
        $('#box').css('top', '5%');
        $('#back').css('bottom', '0');
        $('#inp_mob').css('bottom', 'calc(50% + 120px)');
    }

    function close_upload_info() {

        for (var i = 0; i <= count_files; i++ ){
            form_data.delete('files' + i);
            $('.pr' + i).remove();
        }
        count_files = 0;
        num_file = 0;

        $('.upload_info').css({
            'margin-left': '5%',
            'margin-right': '5%',
            'width': '90%',
            'height': '50px',
            'background': 'rgba(0,0,0,0)',
            'padding': '0'
        });
        $('.label').css('bottom', '100px');
        $('#upl').css('display', 'none');
        $('#box').css('top', '20%');
        $('#back').css('bottom', '-20%');
        $('#inp_mob').css('bottom', '160px');
    }

    function add_file(file) {

        if (get_ras_file(file.name) === ''){
            return false;
        }

        if (block_list.indexOf(get_ras_file(file.name)) >= 0) {
            alert('Файл с расширением ' + file.name + 'запрещен к загрузке');
            return false;
        }

        if (file.size > max_size) {
            alert('файл весит более ' + max_size/ 1048576  + 'мб, \n а точнее: ' + file.size / 1048576 + 'Мб \nЭто слишком много ');
            return false;
        }

        form_data.append('files' + num_file, file);
        render_preview(file, num_file);
        num_file++;

    }

    $('#stop_upload').click(function () {
        ajax_upl.abort();
        $('.preview_div').css('display', 'block');
        $('#progressbar').css('display', 'none');
    });

    $('#inp_mob').change(function () {
        $(this).val('');
    });




});



