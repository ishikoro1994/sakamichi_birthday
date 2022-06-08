const GRP_NOGI_CLASS = "grp_nogi";
const GRP_SAKURA_CLASS = "grp_sakura";
const GRP_HINATA_CLASS = "grp_hinata";
var memberList = [];
var todayBirthMember = [];

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

    $('#graduat_isdisp').on('change', function() {
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
    // 初期化
    todayBirthMember = [];
    $('#birthday_list_tbl tbody').empty();
    $('#birthday_list_tbl').append('<tbody id="birthday_list_tbody">');

    var rowCnt = 0;
    var today = new Date();
    // 今日以降のみを取得
    memberList.forEach(function(element){
        // 選択されていないグループは表示しない
        if ($.inArray(element.group.toString(), GetCheckedGrp()) < 0) {
            return;
        }

        var memberRow = GetMemberRow(today, rowCnt, element, true);
        if (memberRow) {
            rowCnt++;
            $('#birthday_list_tbl').append(memberRow);
        }
    });

    // 今日より前のみを取得
    memberList.forEach(function(element){
        // 選択されていないグループは表示しない
        if ($.inArray(element.group.toString(), GetCheckedGrp()) < 0) {
            return;
        }

        var memberRow = GetMemberRow(today, rowCnt, element, false);
        if (memberRow) {
            rowCnt++;
            $('#birthday_list_tbl').append(memberRow);
        }
    });

    $('#birthday_list_tbl').append('</tbody>');

    // 誕生月修正
    var rowSpan = 1;
    var headMonthTr;
    var headMonth = '0月';
    $('#birthday_list_tbody tr').each(function() {
        var month = $(this).children('.month').text();
        if (headMonth != month) {
            // 最上位行もしくは、月が変わった行なら行情報更新
            headMonthTr = this;
            headMonth = month;
            rowSpan = 1;

            // 最上位以外ならセパレーター挿入
            if ($('#birthday_list_tbody tr').index(this) != 0) $(this).before('<tr class="separater"></tr>');
        }
        else {
            rowSpan++;
            $(headMonthTr).children('.month').attr('rowspan', rowSpan);
            $(this).children('.month').remove();
        }
    });

    // 誕生日エリア設定
    if (todayBirthMember.length > 0) {
        $('#today_birthday_member').empty();
        $('#today_birthday_member').append('今日は下記メンバーのお誕生日です。');
        $('#today_birthday_member').append('</br>');
        let birthdayMemberGrp = "";
        let birthdayMemberName = "";
        let today = new Date();
        todayBirthMember.forEach(function(e) {
            birthdayMemberGrp = e.grp;
            birthdayMemberName = e.member.toString().replace(' ', '');
            $('#today_birthday_member').append('・' + e.grp + ' ' + e.member + 'さん');
            $('#today_birthday_member').append('</br>');
        });
        $('#today_birthday_member').append('おめでとうございます！！');

        $('#tweet_area').empty();
        $('#tweet_label').empty();
        $('#tweet_label').text('お祝いメッセージを');
        let hashtags = '';
        hashtags += birthdayMemberGrp + ',';
        hashtags += birthdayMemberName + '生誕祭,';
        hashtags += birthdayMemberName + '生誕祭' + today.getFullYear();
        // ツイートボタン作成
        twttr.widgets.createShareButton(
            "",
            document.getElementById("tweet_area"),
            {
              text: '\n',
              url: 'https://ishikoro1994.github.io/sakamichi_birthday/',
              hashtags: hashtags,
              lang: 'ja',
              related: 'ishikoro1994'
            }
          );
    }
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

    if ($('#graduat_isdisp:checked').val() && element.is_graduat == '1') {
        // 卒業生を表示しない
        return;
    }

    var memberName = element.member;
    if (element.is_graduat == '1') {
        memberName += '(卒)';
    }

    if (dt.getTime() == birthday.getTime()) {
        let obj = {grp: element.group, member: memberName};
        todayBirthMember.push(obj);
    }

    var rowInfo = '';
    var grpClass = GRP_SAKURA_CLASS;
    if (element.group == "乃木坂46") grpClass = GRP_NOGI_CLASS;
    if (element.group == "日向坂46") grpClass = GRP_HINATA_CLASS;

    var rowClass = "odd_row";
    if (rowCnt % 2 == 0) rowClass = "even_row";
    rowInfo += '<tr class="' + rowClass + '">';
    rowInfo += '<td class="month month_row">' + element.month + '月</td>';
    rowInfo += '<td class="group '+ grpClass +'">' + element.group + '</td>';
    rowInfo += '<td class="member">' + memberName + '</td>';
    let m = element.month;
    if (m.length == 1) m = '0' + m;
    let d = element.day;
    if (d.length == 1) d = '0' + d;
    rowInfo += '<td class="birthday birthday_row">' + element.year + '年 ' + m + '月' + d + '日' + '</td>';
    rowInfo += '</tr>';

    return rowInfo;
}
