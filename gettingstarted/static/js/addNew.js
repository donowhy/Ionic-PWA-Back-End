(function($){
    $(function(){



        $('.button-collapse').sideNav();




    }); // end of document ready
})(jQuery); // end of jQuery name space


function getCookie(c_name) {
    if(document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if(c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if(c_end == -1) c_end = document.cookie.length;
            return unescape(document.cookie.substring(c_start,c_end));
        }
    }
    return "";
}
var csrftoken = getCookie('csrftoken');
function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

var PAGINATION = [];
var REQUESTS = [];
var CURRENT_PAGE = 1;
var CLOTH_TYPE = "Shirt";
populate_product();

function populate_product(){
    $("#product_list").empty();
    $("#routineLoader").show();
    console.log("CALLING POPULATE PRODUCT ON ", CLOTH_TYPE);
    console.log("REQUESTS = ", REQUESTS);
    REQUESTS.push(
        $.ajax({
                type: 'POST',
                url: 'get_product/',
                headers: {
                    "X-CSRFToken": getCookie("csrftoken")
                },
                data: {'cloth_type': CLOTH_TYPE},
                success: function (json) {
                    console.log("json = ", json);
                    PAGINATION = json.products;
                    product_loader_template(json.products);
                    load_pagination();
                    load_page(1);
                    $("#loading_paginate").show();
                    $("#routineLoader").hide();
                    back_load_product()
                },
                error: function (json) {
                    // $("#createRoutine").show();
                    console.log("ERROR", json);
                }
            }
        )
    );
}

function product_loader_template(items){
    $("#product_list").empty();
    for(var i=0; i < items.length; i++){
        $("#product_list").append("<img onclick=\"itemClick('" + items[i].item_id + "')\" id='item"+items[i].item_id+"' class='clothItem' src='"+items[i].small_url+"'>");
    }
}

function itemClick(id){
    console.log("clicked ", id);
    for(var i=0; i < PAGINATION.length; i++){
        if (PAGINATION[i].item_id == id){
            console.log("found");
            displayOnCanvas(PAGINATION[i]);
            break;
        }
    }
}

function displayOnCanvas(item){
    if(item.cloth_type == "Shirt"){
        $("#shirt").html("<img class='outfitCanvasItem' id='can"+item.item_id+"' src='"+item.large_url+"'>");
        hammerIt(document.getElementById("can"+item.item_id));
    }
    else if(item.cloth_type == "Pants"){
        $("#pants").html("<img class='outfitCanvasItem' src='"+item.large_url+"'>");
    }
    else if(item.cloth_type == "Shoes"){
        $("#shoes").html("<img class='outfitCanvasItem' src='"+item.large_url+"'>");
    }
}

function hammerIt(elm) {
    hammertime = new Hammer(elm, {});
    hammertime.get('pinch').set({
        enable: true
    });
    var posX = 0,
        posY = 0,
        scale = 1,
        last_scale = 1,
        last_posX = 0,
        last_posY = 0,
        max_pos_x = 0,
        max_pos_y = 0,
        transform = "",
        el = elm;

    hammertime.on('doubletap pan pinch panend pinchend', function(ev) {
        if (ev.type == "doubletap") {
            transform =
                "translate3d(0, 0, 0) " +
                "scale3d(2, 2, 1) ";
            scale = 2;
            last_scale = 2;
            try {
                if (window.getComputedStyle(el, null).getPropertyValue('-webkit-transform').toString() != "matrix(1, 0, 0, 1, 0, 0)") {
                    transform =
                        "translate3d(0, 0, 0) " +
                        "scale3d(1, 1, 1) ";
                    scale = 1;
                    last_scale = 1;
                }
            } catch (err) {}
            el.style.webkitTransform = transform;
            transform = "";
        }

        //pan
        posX = last_posX + ev.deltaX;
        posY = last_posY + ev.deltaY;
        max_pos_x = el.clientWidth / 2.2;
        max_pos_y = el.clientHeight / 4;
        if (posX > max_pos_x) {
            posX = max_pos_x;
        }
        if (posX < -max_pos_x) {
            posX = -max_pos_x;
        }
        if (posY > max_pos_y) {
            posY = max_pos_y;
        }
        if (posY < -max_pos_y+30) {
            posY = -max_pos_y+30;
        }


        //pinch
        if (ev.type == "pinch") {
            scale = Math.max(.5, Math.min(last_scale * (ev.scale), 1.5));
        }
        if(ev.type == "pinchend"){last_scale = scale;}

        //panend
        if(ev.type == "panend"){
            last_posX = posX < max_pos_x ? posX : max_pos_x;
            last_posY = posY < max_pos_y ? posY : max_pos_y+30;
        }

        transform =
            "translate3d(" + posX + "px," + posY + "px, 0) " +
            "scale3d(" + scale + ", " + scale + ", 1)";

        if (transform) {
            el.style.webkitTransform = transform;
        }
    });
}

function back_load_product(){
    REQUESTS.push(
        $.ajax({
                type: 'POST',
                url: 'get_product_full/',
                headers: {
                    "X-CSRFToken": getCookie("csrftoken")
                },
                data: {'cloth_type': CLOTH_TYPE},
                success: function (json) {
                    console.log("in back_load, json = ", json);
                    PAGINATION = json.products;
                    $("#loading_paginate").show();
                    load_pagination();
                    load_page(1);
                },
                error: function (json) {
                    // $("#createRoutine").show();
                    console.log("ERROR", json);
                }
            }
        )
    );
}

function load_pagination(){
    var itemsPerPage = 15;
    console.log("pagination - ", PAGINATION);
    var itemLength = PAGINATION.length;
    var pages = Math.ceil(itemLength / itemsPerPage);

    console.log("items per page = ", itemsPerPage);
    console.log("items length = ", itemLength);
    console.log("pages = ", pages);
    $("#pagination").empty();
    $("#pagination").append("<li onClick='page_prev()' class='disabled'><a href='#!'><i class='material-icons'>chevron_left</i></a></li>"
                            + "<li onClick='load_page(1)' id='pag1' class='active'><a href='#!'>1</a></li>");
    for(var i=2; i <= pages; i++){
        $("#pagination").append("<li onClick='load_page("+ i +")' id='pag"+i+"' class='waves-effect'><a href='#!'>"+i+"</a></li>");
    }
    $("#pagination").append("<li onClick='page_next()' class='waves-effect'><a href='#!'><i class='material-icons'>chevron_right</i></a></li>");
    $("#loading_paginate").hide();
}

function page_prev(){
    load_page(CURRENT_PAGE-1);
}

function page_next(){
    load_page(CURRENT_PAGE+1);
}

function load_page(page){
    console.log("loading page ", page);
    var itemsPerPage = 15;
    var itemLength = PAGINATION.length;
    var pages = Math.ceil(itemLength / itemsPerPage);

    if (pages >= page){
        if( page > 0) {
            $("li.active").removeClass("active");
            $("#pag"+page).addClass("active");
            CURRENT_PAGE = page;
            var items = [itemsPerPage * (page - 1), (itemsPerPage * (page)) - 1];
            product_loader_template(PAGINATION.slice(items[0], items[1]));
        }
    }
}

function remove_requests(){
    for(var i = 0; i < REQUESTS.length; i++) {
        REQUESTS[i].abort();
        REQUESTS.splice( i, 1 );
        console.log("request aborted");

    }
}

function shirtClick(elem){
    console.log("elem = ", elem);
    CLOTH_TYPE = "Shirt";
    $(".clothType").removeClass("red");
    $("#"+elem).addClass("red");
    remove_requests();
    populate_product();
}

function pantsClick(elem){
    console.log("elem = ", elem);
    CLOTH_TYPE = "Pants";
    $(".clothType").removeClass("red");
    $("#"+elem).addClass("red");
    remove_requests();
    populate_product();
}

function shoesClick(elem){
    console.log("elem = ", elem);
    CLOTH_TYPE = "Shoes";
    $(".clothType").removeClass("red");
    $("#"+elem).addClass("red");
    remove_requests();
    populate_product();
}

