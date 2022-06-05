const GRP_NOGI_CLASS = "grp_nogi";
const GRP_SAKURA_CLASS = "grp_sakura";
const GRP_HINATA_CLASS = "grp_hinata";
var memberList = [];

/**
 * ページ読み込み時
 */
$(document).ready(function() {
    var d = new $.Deferred();
    async(function() {
        LoadBirthdayListJson();
        d.resolve();
    });

    d.promise()
        .then(function() {
            var d2 = new $.Deferred();
            async(function() {
                SetBirthdayList();
                d2.resolve();
            });
            return d2.promise();
        });
});

function async(f) {
    setTimeout(f, 500);
}

$(function() {
    $('input[name="select_grp"]').on('change', function() {
        SetBirthdayList();
    });
});

function LoadBirthdayListJson() {
    $.getJSON('./data/sakamichi_birthday.json' , function(data) {
        if (data) {
            memberList = data.data;
        }
    });
}

function SetBirthdayList() {
    $('#birthday_list_tbl').empty();

    var headInfo = '';
    headInfo += '<thead style="text-align: center;">';
    headInfo += '<tr>';
    headInfo += '<th class="">グループ</th>';
    headInfo += '<th class="">メンバー</th>';
    headInfo += '<th class="">生年月日</th>';
    headInfo += '</tr>';
    headInfo += '</thead>';

    $('#birthday_list_tbl').append(headInfo);
    $('#birthday_list_tbl').append('<tbody id="birthday_list_tbody">');

    var rowCnt = 0;
    var today = new Date();
    memberList.forEach(function(element){
        // 選択されていないグループは表示しない
        if ($.inArray(element.group.toString(), GetCheckedGrp()) < 0){
            return;
        }

        var memberRow = GetMemberRow(today, rowCnt, element, true);
        if (memberRow) {
            rowCnt++;
            $('#birthday_list_tbl').append(memberRow);
        }
    });
    memberList.forEach(function(element){
        // 選択されていないグループは表示しない
        if ($.inArray(element.group.toString(), GetCheckedGrp()) < 0){
            return;
        }

        var memberRow = GetMemberRow(today, rowCnt, element, false);
        if (memberRow) {
            rowCnt++;
            $('#birthday_list_tbl').append(memberRow);
        }
    });

    $('#birthday_list_tbl').append('</tbody>');
    $('#birthday_list_tbl').show();
}

function GetCheckedGrp() {
    var selectGrp = $('input[name=select_grp]:checked').map(function(){
        return $(this).val();
    }).get();
    return selectGrp;
}

function GetMemberRow(today, rowCnt, element, isAfter) {
    var dt = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    var birthday = new Date(dt.getFullYear(), element.month, element.day);

    if (isAfter) {
        // 今日以降のみを取得する
        if (dt > birthday) return;
    } else {
        // 今日より前のみを取得する
        if (dt <= birthday) return;
    }

    var rowInfo = '';
    var grpClass = GRP_SAKURA_CLASS;
    if (element.group == "乃木坂46") grpClass = GRP_NOGI_CLASS;
    if (element.group == "日向坂46") grpClass = GRP_HINATA_CLASS;

    rowCnt++;
    var rowClass = "odd_row";
    if (rowCnt % 2 == 0) rowClass = "even_row";
    rowInfo += '<tr class="' + rowClass + '">';
    rowInfo += '<td class="grp '+ grpClass +'">' + element.group + '</td>';
    rowInfo += '<td class="name">' + element.member + '</td>';
    let m = element.month;
    if (m.length == 1) m = '0' + m;
    let d = element.day;
    if (d.length == 1) d = '0' + d;
    rowInfo += '<td class="birthday">' + element.year + ' / ' + m + ' / ' + d + '</td>';
    rowInfo += '</tr>';

    return rowInfo;
}