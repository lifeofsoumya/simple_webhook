import express from "express"
import mongoose from "mongoose"
import rateLimit from "express-rate-limit"
import dotenv from 'dotenv'
dotenv.config()

const app = express();

app.use(express.json());

mongoose.connect(process.env.MONGOOSE_URI);

const Message = mongoose.model('Message', { content: String });

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
});

app.use('/webhook', limiter);

app.post('/webhook', (req, res) => {
  const message = req.body.message;

  const newMessage = new Message({ content: message });
  newMessage.save()
    .then(() => {
      console.log('Message saved to MongoDB:', message);
      res.status(200).send('Message saved successfully');
    })
    .catch(err => {
      console.error('Error saving message to MongoDB:', err);
      res.status(500).send('Error saving message');
    });
});

app.get('/', (req, res)=>{
        res.status(200).send('Really long way to go!')
        })

app.get('/v1/', (req, res)=>{ res.status(200).json({response: 'will be live soon'}) })

app.get('/res', (req, res) => {
        const key = req.query.key;
        console.log(key, ' key')
        if(key == process.env.PASSKEY){
        Message.find()
        .then(messages => {
                const msg = messages.map((each, index) => `${index+1}. ${each.content}`)
                res.status(200).json(msg);
        })
        .catch(err => {
                console.error('Error fetching messages from MongoDB:', err);
                res.status(500).send('Error fetching messages');
            });
        }
        else {
                res.status(202).json({response: 'key mismatch'})
        }
});

app.listen(8080, ()=> console.log('server running on port 8080'))
