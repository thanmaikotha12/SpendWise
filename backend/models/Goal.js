import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},
  name:{type:String,required:true},
  targetAmount:{type:Number,required:true,min:1},
  savedAmount:{type:Number,default:0,min:0},
  deadline:{type:Date}
},{timestamps:true});
export default mongoose.model('Goal',schema);
