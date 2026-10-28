import jwt from 'jsonwebtoken';
export default function auth(req,res,next){
  const token=req.headers.authorization?.startsWith('Bearer ')?req.headers.authorization.slice(7):null;
  if(!token) return res.status(401).json({message:'Authentication required'});
  try{req.userId=jwt.verify(token,process.env.JWT_SECRET).id;next();}
  catch{res.status(401).json({message:'Invalid or expired token'});}
}
