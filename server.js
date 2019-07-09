var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');
var fetch = require('node-fetch');

var app = express();

app.set('port', process.env.PORT || 5000);

app.use(express.static('public'));
app.use(bodyParser.json());

///*
// ———————— ADDED MOCKING SERVICE ————————
app.post('/mock', function (req, res) {
    console.log('This goes to mulesoft -> ');
    console.log(req.body);
    //console.log('here', Object.keys(req.body));
    res.status(200).send(req.body);
});
// ———————— ADDED MOCKING SERVICE ————————  
//*/

///*
// ———————— ADDED PUBLISH SERVICE ————————
const publishToMule = (req, res) => {
    console.log(req.body);
    const baseUrl = process.env.MULESOFT_BASE_URL || 'http://localhost:5000';
    const subUrl = process.env.MULESOFT_URL || 'mock';
    console.log(baseUrl, subUrl);
    fetch(new URL(subUrl, baseUrl), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' , 'SFOverride': 'false'},
        body: JSON.stringify({
            FirstName: req.body.firstName, LastName: req.body.lastName,
            Email: req.body.email, Phone: req.body.phone, DOB: '1990-01-01'
        })
    }).then(response => {
        console.log('random success');
    }).catch(err => { console.log(err); });

    res.status(200).send(req.body);
}
// ———————— ADDED PUBLISH SERVICE ————————
//*/

app.post('/update', function (req, res) {

    // Publish the rows to mulesoft | mocking service
    publishToMule(req, res);

    /*
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        // watch for any connect issues
        if (err) console.log(err);
        conn.query(
            'UPDATE salesforce.Contact SET Phone = $1, MobilePhone = $1 WHERE LOWER(FirstName) = LOWER($2) AND LOWER(LastName) = LOWER($3) AND LOWER(Email) = LOWER($4)',
            [req.body.phone.trim(), req.body.firstName.trim(), req.body.lastName.trim(), req.body.email.trim()],
            function (err, result) {
                if (err != null || result.rowCount == 0) {
                    conn.query('INSERT INTO salesforce.Contact (Phone, MobilePhone, FirstName, LastName, Email) VALUES ($1, $2, $3, $4, $5)',
                        [req.body.phone.trim(), req.body.phone.trim(), req.body.firstName.trim(), req.body.lastName.trim(), req.body.email.trim()],
                        function (err, result) {
                            done();
                            if (err) {
                                res.status(400).json({ error: err.message });
                            }
                            else {
                                // this will still cause jquery to display 'Record updated!'
                                // eventhough it was inserted
                                res.json(result);
                                // Publish the rows to mulesoft | mocking service
                                publishToMule(req, res);

                            }
                        });
                }
                else {
                    done();
                    res.json(result);
                    // Publish the rows to mulesoft | mocking service
                    publishToMule(req, res);

                }
            }
        );
    });
    //*/

});

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
