const express = require('express');
const { getTopics } = require( './controllers/topics.controllers' );
const { handleServerErrors } = require( './errors/errors' );
const { getApiInfo } = require( './controllers/api.controllers' );

const app = express()


app.get('/api', getApiInfo)

app.get('/api/topics', getTopics)

app.use(handleServerErrors)

module.exports = app