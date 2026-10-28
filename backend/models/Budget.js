import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},
  category:{type:String,required:true},
  amount:{type:Number,required:true,min:0},
  month:{type:Number,required:true,min:1,max:12},
  year:{type:Number,required:true}
},{timestamps:true});
schema.index({userId:1,category:1,month:1,year:1},{unique:true});
export default mongoose.model('Budget',schema);
