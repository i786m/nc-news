exports.handleServerErrors = (err, req, res, next) => {
    res.status(500).send({ msg: 'Server Error' });
};

exports.handlePsqlErrors = (err, req, res, next) => {
  if(err.code==='42P01'){
    next(err)
  }else if(err.code){
    res.status(400).send({ msg: 'Bad Request' });
  } else next(err);
};

exports.handleCustomErrors = (err, req, res, next) => {
  if (err.msg && err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
};
