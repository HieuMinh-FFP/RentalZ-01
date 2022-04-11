// Create or Open Database.
var db = window.openDatabase('FGW', '1.0', 'FGW', 20000);
// To detect whether users use mobile phones horizontally or vertically.
$(window).on('orientationchange', onOrientationChange);
function onOrientationChange(e) {
    if (e.orientation == 'portrait') {
        console.log('Portrait.');
    }
    else {
        console.log('Landscape.');
    }
}
// To detect whether users open applications on mobile phones or browsers.
if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
    $(document).on('deviceready', onDeviceReady);
}
else {
    onDeviceReady();
}
// Display messages in the console.
function log(message) {
    console.log(`[${new Date()}] ${message}`);
}
// Display errors when executing SQL queries.
function transactionError(tx, error) {
    log(`Errors when executing SQL query. [Code: ${error.code}] [Message: ${error.message}]`);
}
// Run this function after starting the application.
function onDeviceReady() {
    // Logging.
    log(`Device is ready.`);
    db.transaction(function (tx) {
        // CREATE TABLE 'ACCOUNT'
        var query = `CREATE TABLE IF NOT EXISTS Account (Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                Username TEXT NOT NULL UNIQUE,
                                Password TEXT NOT NULL)`;
        //CREATE TABLE 'PROPERTY'
        var query = `CREATE TABLE IF NOT EXISTS Activity (Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                        REPORTER TEXT UNIQUE NOT NULL,                                                                                            
                                                        NAME TEXT UNIQUE NOT NULL,
                                                        City INTEGER NOT NULL,
                                                        District INTEGER NOT NULL,
                                                        Ward INTEGER NOT NULL,
                                                        Date DATETIME NOT NULL,   
                                                        DateOfAttending DATETIME NOT NULL)`;

        tx.executeSql(query, [], function (tx, result) {
            // Logging 'Property'.
            log(`Create table 'Activity' successfully.`);
        }, transactionError);

        // CREATE TABLE 'COMMENT'
        var query = `CREATE TABLE IF NOT EXISTS Comment (Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                  AccountId INTEGER NOT NULL ,
                                  Comment TEXT NOT NULL,
                                  FOREIGN KEY(AccountId) REFERENCES Account(Id))`;
                                  
        tx.executeSql(query, [], transactionSuccess, transactionError);
        function transactionSuccess(tx, result) {
            // Logging.
            log(`Create table 'Comment' successfully.`);
        }
        prepareDatabase(db);
    });
}

    $(document).on('pagebeforeshow', '#page-create', function(){
        importCity('#page-create #frm-register');
    });
    $(document).on('change', '#page-create #frm-register #city', function(){
        importOthers('#page-create #frm-register', 'District', 'City');
        importOthers('#page-create #frm-register', 'Ward', 'District');

    });
    $(document).on('change', '#page-create #frm-register #district', function(){
        importOthers('#page-create #frm-register', 'Ward', 'District');

    });

    function importCity(form, selectedId = -1){
        db.transaction(function (tx) {
            var query = 'SELECT * FROM City ORDER BY NAME';
            tx.executeSql(query, [], transactionSuccess, transactionError);

            function transactionSuccess(tx, result) {
                var optionList = `<option value='-1'>Select City</option>`;
                for (let item of result.rows){
                    optionList += `<option value='${item.Id}' ${selectedId == item.Id ? 'selected' : ''}>${item.Name}</option>`;
                }
                $(`${form} #city`).html(optionList);
                $(`${form} #city`).selectmenu('refresh', true);
            }
        });
    }

    function importOthers(form, name, parentName, selectedId = -1){
        var lowerName = name.toLowerCase();
        var id = $(`#page-create #frm-register #${parentName.toLowerCase()}`).val();

        db.transaction(function (tx) {
            var query = `SELECT * FROM ${name} WHERE ${parentName}Id = ? ORDER BY NAME`;
            tx.executeSql(query, [id], transactionSuccess, transactionError);

            function transactionSuccess(tx, result) {
                var optionList = `<option value='-1'>Select ${name}</option>`;
                for (let item of result.rows){
                    optionList += `<option value='${item.Id}' ${selectedId == item.Id ? 'selected' : ''}>${item.Name}</option>`;
                }
                $(`${form} #${lowerName}`).html(optionList);
                $(`${form} #${lowerName}`).selectmenu('refresh', true);
            }
        });
    }

    function getFormInfoByValue(form, isNote) {
        var note = isNote ? $(`${form} #note`).val() : '';
    
        var info = {
            'REPORTER': $(`${form} #reporter`).val(),
            'NAME': $(`${form} #activity-name`).val(),
            'City': $(`${form} #city`).val(),
            'District': $(`${form} #district`).val(),
            'Ward': $(`${form} #ward`).val(),
            'date': $(`${form} #date`).val(),
            'DateOfAttending': $(`${form} #date-of-attending`).val()
        };
    
        return info;
    }
    
    function getFormInfoByName(form, isNote) {
        var note = isNote ? $(`${form} #note`).val() : '';
        var info = {
            'REPORTER': $(`${form} #reporter`).val(),
            'NAME': $(`${form} #activity-name`).val(),
            'City': $(`${form} #city option:selected`).val(),
            'District': $(`${form} #district option:selected`).val(),
            'Ward': $(`${form} #ward option:selected`).val(),
            'date': $(`${form} #date`).val(),
            'DateOfAttending': $(`${form} #date-of-attending`).val()
        };
    
        return info;
    }

    /*
    function setFormInfo(form, info, isNote) {
        $(`${form} #name`).val(info.Name);
        $(`${form} #street`).val(info.Street);
        $(`${form} #city`).val(info.City);
        $(`${form} #district`).val(info.District);
        $(`${form} #ward`).val(info.Ward);
        $(`${form} #type`).val(info.Type);
        $(`${form} #bedroom`).val(info.Bedroom);
        $(`${form} #price`).val(info.Price);
        $(`${form} #furniture`).val(info.Furniture);
        $(`${form} #reporter`).val(info.Reporter);

        if (isNote)
            $(`${form} #note`).val(info.Note);
    }
    */
    function setHTMLInfo(form, info, isNote, isDate = false) {
        $(`${form} #reporter`).text(info.REPORTER);
        $(`${form} #activity-name`).text(info.NAME);
        // fix
        $(`${form} #city`).text(info.City); 
        $(`${form} #district`).text(info.District);
        $(`${form} #ward`).text(info.Ward);
        $(`${form} #date`).text(info.Date);
        $(`${form} #date-of-attending`).text(info.DateOfAttending);
    }


    function isValid(form) {
        var isValid = true;
        var error = $(`${form} #error`);

        error.empty();

        if ($(`${form} #city`).val() == -1) {
            isValid = false;
            error.append('<p>* City is required.</p>');
        }

        if ($(`${form} #district`).val() == -1) {
            isValid = false;
            error.append('<p>* District is required.</p>');
        }

        if ($(`${form} #ward`).val() == -1) {
            isValid = false;
            error.append('<p>* Ward is required.</p>');
        }

        if ($(`${form} #type`).val() == -1) {
            isValid = false;
            error.append('<p>* Type is required.</p>');
        }

        return isValid;
    }


// Submit activity name
$(document).on('submit', '#page-create #frm-register', confirmActivity);
$(document).on('submit', '#page-create #frm-confirm', registerActivity);

function confirmActivity(e) {
    e.preventDefault();

    if (isValid('#page-create #frm-register')) {
        var info = getFormInfoByName('#page-create #frm-register', true);

        db.transaction(function (tx) {
            var query = 'SELECT * FROM Activity WHERE NAME = ?';
            tx.executeSql(query, [info.NAME], transactionSuccess, transactionError);

            function transactionSuccess(tx, result) {
                if (result.rows[0] == null) {
                    log('Open the confirmation popup.');

                    $('#page-create #error').empty();

                    setHTMLInfo('#page-create #frm-confirm', info, true);

                    $('#page-create #frm-confirm').popup('open');
                }
                else {
                    var error = 'Name exists.';
                    $('#page-create #error').empty().append(error);
                    log(error, ERROR);
                }
            }
        });
    }
}

// Submit a form to register a new account.

function registerActivity(e) {
    e.preventDefault();

    var info = getFormInfoByValue('#page-create #frm-register', true);

    db.transaction(function (tx) {
        //Cai nay de cho du lieu vao activity
        var query = `INSERT INTO Activity (REPORTER, NAME, city, district, ward, date, DateOfAttending) VALUES (?,?,?,?,?,?,?)`;
        tx.executeSql(query, [info.REPORTER, info.NAME, info.City, info.District, info.Ward, info.date, info.DateOfAttending], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Create a Activity '${info.NAME}' successfully.`);

            $('#page-create #frm-register').trigger('reset');
            $('#page-create #error').empty();
            $('#page-create #frm-register #name').focus();

            $('#page-create #frm-confirm').popup('close');
        }
    });
}

// Dislplay Activity list
$(document).on('pagebeforeshow', '#page-list', showList);
function showList() {
    db.transaction(function (tx) {
        var query = 'SELECT Id, REPORTER, NAME, city, district, ward, date, DateOfAttending FROM Activity';
        tx.executeSql(query, [], transactionSuccess, transactionError);
        function transactionSuccess(tx, result) {
            // Logging 
            log(`Create a activity-name' successfully.`);
            // Prepare the list of accounts.
            var listActivity = `<ul id='list-activity' data-role='listview' data-filter='true' data-filter-placeholder='Search property...'
                                                     data-corners='false' class='ui-nodisc-icon ui-alt-icon'>`;
            for (let property of result.rows) {
                listActivity += `<li><a data-details='{"Id" : ${property.Id}}'>
                                    <img src='img/chotot_logo.jpg'>
                                    <h3>ACTIVITY NAME: ${property.NAME}</h3>
                                    <p>ID: ${property.Id}</p>
                                    <p>PROPERTY ADDRESS: ${property.City}, ${property.District}, ${property.Ward}</p>
                                </a></li>`;
            }
            listActivity += `</ul>`;
            // Add list to UI.
            $('#list-activity').empty().append(listActivity).trigger('create');
        }
    });
}

// Save Account Id.
$(document).on('vclick', '#list-activity li a', function (e) {
    e.preventDefault();
    var id = $(this).data('details').Id;
    localStorage.setItem('currentActivityId', id);
    $.mobile.navigate('#page-detail', { transition: 'none' });
});
// Show Account Details.
$(document).on('pagebeforeshow', '#page-detail', showDetail);
function showDetail() {
    var id = localStorage.getItem('currentActivityId');
    db.transaction(function (tx) {
        var query = 'SELECT * FROM Activity WHERE Id = ?';
        tx.executeSql(query, [id], transactionSuccess, transactionError);
        function transactionSuccess(tx, result) {
            var errorMessage = 'Property not found.';
            var reporter = errorMessage;
            var activity_name = errorMessage;
            var city = errorMessage;
            var district = errorMessage;
            var ward = errorMessage;
            var date = errorMessage;
            var DateOfAttending = errorMessage;
            if (result.rows[0] != null) {
                reporter = result.rows[0].REPORTER;
                activity_name = result.rows[0].NAME;
                city = result.rows[0].City;
                district = result.rows[0].District;
                ward = result.rows[0].Ward;
                date = result.rows[0].Date;
                DateOfAttending = result.rows[0].DateOfAttending ;
            }
            else {
                log(errorMessage);

                $('#page-detail #btn-update').addClass('ui-disabled');
                $('#page-detail #btn-delete-confirm').addClass('ui-disabled');
            }

            $('#page-detail #Id').text(id);
            $('#page-detail #reporter').text(reporter);
            $('#page-detail #activity-name').text(activity_name);
            $('#page-detail #city').text(city);
            $('#page-detail #district').text(district);
            $('#page-detail #ward').text(ward);
            $('#page-detail #date').text(date);
            $('#page-detail #date-of-attending').text(DateOfAttending);
        }
    });
}
// Delete Account.
$(document).on('vclick', '#page-detail #btn-delete', deleteProperty);
function deleteProperty() {
    var id = localStorage.getItem('currentActivityId');

    db.transaction(function (tx) {
        var query = 'DELETE FROM Activity WHERE Id = ?';
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Delete property '${id}' successfully.`);

            $.mobile.navigate('#page-list', { transition: 'none' });
        }
    });
}
$(document).on('vclick','#page-detail #btn-comment', addComment);
function addComment() {
    var id = localStorage.getItem('currentPropertyId');
    var comment = $('#page-detail #popup-comment #txt-comment').val();

    db.transaction(function (tx) {
        var query = 'INSERT INTO Comment (PropertyId, Comment) VALUES(?, ?) ';
        tx.executeSql(query, [id, comment], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Create comments for property '${id}' successfully.`);
            showComment();

            $('#page-detail #popup-comment #txt-comment').val('');
            $('#page-detail #popup-comment' ).popup('close');

        }
    });
}

function showComment(){
    var id = localStorage.getItem('currentPropertyId');
    db.transaction(function (tx) {
        var query = 'SELECT * FROM Comment WHERE PropertyId=?';
        tx.executeSql(query, [id], transactionSuccess, transactionError);
        function transactionSuccess(tx, result) {
           
            log(`Show list of comments  successfully.`);
            
            var listComment = `<ul id='list-comment' data-role='listview'>`;
            for (let comment of result.rows) {
                listComment += `<li>${comment.Comment}</li>`;
            }
            listComment += `</ul>`;
            // Add list to UI.
            $('#list-comment').empty().append(listComment).listview('refresh').trigger('create');
        }
    });
}


// Submit a form to register a new account.
// $(document).on('submit', '#frm-register', confirmAccount);
// function confirmAccount(e) {
//     e.preventDefault();
//     var username = $('#page-create #frm-register #username').val();
//     var password = $('#page-create #frm-register #password').val();
//     var password_confirm = $('#page-create #password-confirm').val();
//     if (password != password_confirm) {
//         $('#password-confirm')[0].setCustomValidity('Password mismatch.');
//     }
//     else {
//         db.transaction(function (tx) {
//             var query = 'SELECT * FROM Account WHERE Username=?';
//             tx.executeSql(query, [username], transactionSuccess, transactionError);
//             function transactionSuccess(tx, result) {
//                if(result.rows[0] == null)
//                {
//                 $('#page-create #popup-register-confirm #username').text(username);

//                 $('#page-create #popup-register-confirm #password').text(password);
            
//                 $('#page-create #popup-register-confirm ').popup('open');

//                } 
//                else{
//                    alert('Account exists.');
//                }
//             }
//         });
//     }
// }

// $(document).on('vclick', '#btn-register-confirm', registerAccount);
// function registerAccount(e) {
//     e.preventDefault();
    // Get user's input.
//     var username = $('#page-create #popup-register-confirm #username').text();
//     var password = $('#page-create #popup-register-confirm #password').text();

//     db.transaction(function(tx) {
//         var query = 'INSERT INTO Account (Username, Password) VALUES (?, ?)';
//         tx.executeSql(query, [username, password], transactionSuccess, transactionError);

//         function transactionSuccess(tx, result) {             
//             // Logging.
//             log(`Create a username '${username}' successfully.`);
//             // Reset the form.
//             $('#frm-register').trigger('reset');
//             $('#username').focus();

//             $('#page-create #popup-register-confirm').popup('close');
//         }
//     });  
// }

// Dislplay Account list
// $(document).on('pagebeforeshow', '#page-list', showList);
// function showList() {
//     db.transaction(function (tx) {
//         var query = 'SELECT Id, Username FROM Account';
//         tx.executeSql(query, [], transactionSuccess, transactionError);
//         function transactionSuccess(tx, result) {
//             // Logging 
//             log(`Create a username' successfully.`);
//             // Prepare the list of accounts.
//             var listAccount = `<ul id='list-account' data-role='listview' data-filter='true' data-filter-placeholder='Search accounts...'
//                                                      data-corners='false' class='ui-nodisc-icon ui-alt-icon'>`;
//             for (let account of result.rows) {
//                 listAccount += `<li><a data-details='{"Id" : ${account.Id}}'>
//                                     <img src='img/boyscout_logo.jpg'>
//                                     <h3>Username: ${account.Username}</h3>
//                                     <p>ID: ${account.Id}</p>
//                                 </a></li>`;
//             }
//             listAccount += `</ul>`;
//             // Add list to UI.
//             $('#list-account').empty().append(listAccount).listview('refresh').trigger('create');
//         }
//     });
//     showComment();
// }
// Save Account Id.
// $(document).on('vclick', '#list-account li a', function (e) {
//     e.preventDefault();
//     var id = $(this).data('details').Id;
//     localStorage.setItem('currentPropertyId', id);
//     $.mobile.navigate('#page-detail', { transition: 'none' });
// });
// // Show Account Details.
// $(document).on('pagebeforeshow', '#page-detail', showDetail);
// function showDetail() {
//     var id = localStorage.getItem('currentPropertyId');
//     db.transaction(function (tx) {
//         var query = 'SELECT * FROM Account WHERE Id = ?';
//         tx.executeSql(query, [id], transactionSuccess, transactionError);
//         function transactionSuccess(tx, result) {
//             var errorMessage = 'Account not found.';
//             var username = errorMessage;
//             var password = errorMessage;
//             if (result.rows[0] != null) {
//                 username = result.rows[0].Username;
//                 password = result.rows[0].Password;
//             }
//             else {
//                 log(errorMessage);

//                 $('#page-detail #btn-update').addClass('ui-disabled');
//                 $('#page-detail #btn-delete-confirm').addClass('ui-disabled');
//             }

//             $('#page-detail #id').text(id);
//             $('#page-detail #username').text(username);
//             $('#page-detail #password').text(password);
//         }
//     });
// }
// Delete Account.
// $(document).on('vclick', '#page-detail #btn-delete', deleteAccount);
// function deleteAccount() {
//     var id = localStorage.getItem('currentPropertyId');

//     db.transaction(function (tx) {
//         var query = 'DELETE FROM Account WHERE Id = ?';
//         tx.executeSql(query, [id], transactionSuccess, transactionError);

//         function transactionSuccess(tx, result) {
//             log(`Delete account '${id}' successfully.`);

//             $.mobile.navigate('#page-list', { transition: 'none' });
//         }
//     });
// }
// $(document).on('vclick','#page-detail #btn-comment', addComment);
// function addComment() {
//     var id = localStorage.getItem('currentPropertyId');
//     var comment = $('#page-detail #popup-comment #txt-comment').val();

//     db.transaction(function (tx) {
//         var query = 'INSERT INTO Comment (AccountId, Comment) VALUES(?, ?) ';
//         tx.executeSql(query, [id, comment], transactionSuccess, transactionError);

//         function transactionSuccess(tx, result) {
//             log(`Create comments for account '${id}' successfully.`);
//             showComment();

//             $('#page-detail #popup-comment #txt-comment').val('');
//             $('#page-detail #popup-comment' ).popup('close');

//         }
//     });
// }

// function showComment(){
//     var id = localStorage.getItem('currentPropertyId');
//     db.transaction(function (tx) {
//         var query = 'SELECT * FROM Comment WHERE AccountId=?';
//         tx.executeSql(query, [id], transactionSuccess, transactionError);
//         function transactionSuccess(tx, result) {
           
//             log(`Show list of comments  successfully.`);
            
//             var listComment = `<ul id='list-comment' data-role='listview'>`;
//             for (let comment of result.rows) {
//                 listComment += `<li>${comment.Comment}</li>`;
//             }
//             listComment += `</ul>`;
//             // Add list to UI.
//             $('#list-comment').empty().append(listComment).listview('refresh').trigger('create');
//         }
//     });
// }
// const inpFile = document.getElementById("inpFile");
// const previewContainer = document.getElementById("imagePreview");
// const previewImage = previewContainer.querySelector(".image-preview__image");
// const previewDefaultText = previewContainer.querySelector(".image-preview__default-text");

// inpFile.addEventListener("change", function() {
//     const file = this.files[0];

//     if (file) {
//         const reader = new FileReader();

//         previewDefaultText.style.display = "none";
//         previewImage.style.display = "block";

//         reader.addEventListener("load", function(){
//             previewImage.setAttribute("src", this.result);
//         });

//         reader.readAsDataURL(file);
//     } else {
//         previewDefaultText.style.display = null;
//         previewImage.style.display = null;
//         previewImage.setAttribute("src", "");
//     }
// });