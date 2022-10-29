const { text } = require('body-parser');
const {validationResult} = require('express-validator'); 

const Note = require('../models/note');
const Category = require('../models/category');

//read notes
exports.getNotes = (req, res, next) => {
    Note
    .find()
    .then(notes => {
        res.status(200).json({message: 'All Notes Founds', notes: notes})
    })
    .catch(err => {
        if (!err.statusCode){
            err.statusCode = 500; 
        }
        next(err); 
    }); 
}

//read a note
exports.getNote = (req, res,next) => {
    const noteId = req.params.noteId;
    Note
    .findById(noteId)
    .then(note => {
        if (!note){
            const error = new Error('Note not Found!');
            error.statusCode = 404;
            throw error; //this will actually go on to the catch block
        }
        res.status(200).json({ message: 'Note Found!', note: note})
    })
    .catch(err => {
        if (!err.statusCode){
            err.statusCode = 500; 
        }
        next(err); 
    }); 
}

//add note
exports.postAddNote = (req, res, next) => {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()){ 
       const error = new Error('Input Validation Failed!');
       error.statusCode = 422;
       error.data = errors.array();
       throw error;
    };
    const categoryId = req.params.categoryId;
    const title = req.body.title;
    const text = req.body.text;
    const tag = req.body.tag;
    const note = new Note({
        title: title,
        text: text,
        tag: tag,
        creator: req.userId,
        categoryId: categoryId
    });
    note
    .save()
    .then(result => {
        res.status(201).json({
            message: 'Note Created Successfully',
            note: result 
        })
    })
    .catch(err => {
        if (!err.statusCode){
            err.statusCode = 500; 
        }
        next(err); 
    });   
}

//edit note
exports.editNote = (req, res, next) => {
    const noteId = req.params.noteId;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation Error');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    };
    const title = req.body.title;
    const text = req.body.text;
    const tag = req.body.tag;
    Note
    .findById(noteId)
    .then(note => {
        if (!note){
            const error = new Error('Could not find note');
            error.statusCode = 404;
            throw error;
        }
        note.title = title;
        note.text = text;
        note.tag = tag;
        return note.save();
    })
    .then( result => {
       res.status(200).json({message: 'Note updated successfully', note: result});
    })
    .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
}

//delete note
exports.deleteNote = (req, res, next) => {
    console.log('pweath?');
    const noteId = req.params.noteId;
    Note
    .findById(noteId)
    .then( note => {
        if (!note){
            const error = new Error('Note not Found!');
            error.statusCode = 404;
            throw error; 
        }
        return Note.findByIdAndRemove(noteId);
    })
    .then( result => {
        console.log(result);
        res.status(200) //operation successful
        .json({message: 'Note Deleted!'})
    })
    .catch(err => {
        if (!err.statusCode){
            err.statusCode = 500; //server-side error
        }
        next(err); //will jump to the next error handling middleware (in app.js)
    });
}

//read categories
exports.getCategories = (req, res, next) => {
    Category
    .find()
    .then( categories => {
        console.log(categories);
        res.status(200).json({message: 'All Categories Founds', categories: categories})
    })
    .catch(err => {
        if (!err.statusCode){
            err.statusCode = 500; 
        }
        next(err); 
    }); 
};

//add category
exports.postAddCategory = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        const error= new Error('Input Validation Failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    };
    const title = req.body.title;
    const description = req.body.description;
    const category = new Category({
        title: title,
        description: description
    });
    category
    .save()
    .then(result => {
        res.status(201).json({
            message: 'Category Created Successfully',
            category: result 
        })
    })
    .catch(err => {
        if (!err.statusCode){
            err.statusCode = 500; 
        }
        next(err); 
    });   
}

//edit category
exports.editCategory= (req, res, next) => {
    const categoryId = req.params.categoryId;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation Error');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const title = req.body.title;
    const description = req.body.description;
    Category
    .findById(categoryId)
    .then(category => {
        if (!category){
            const error = new Error('Could not find category');
            error.statusCode = 404;
            throw error;
        }
        category.title = title;
        category.description = description;
        return category.save();
    })
    .then( result => {
       res.status(200).json({message: 'Category updated successfully', category: result});
    })
    .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
}

//delete category
exports.deleteCategory = (req, res, next) => {
    const categoryId = req.params.categoryId;
    console.log(categoryId);
    Category
    .findById(categoryId)
    .then( category => {
        console.log(category);
        if (!category){
            console.log("hey");
            const error = new Error('Category not Found!');
            error.statusCode = 404;
            throw error; 
        }
        return Category.findByIdAndRemove(categoryId);
    })
    .then( result => {
         return Note
        .find({categoryId: categoryId})
        .remove();
    })
    .then( result => {
        res
        .status(200) 
        .json({message: 'Category Deleted in addition to all notes pertaining to it!'})
    })
    .catch(err => {
        if (!err.statusCode){
            err.statusCode = 500; 
        }
        next(err); 
    });
}

//filter by category
exports.getCategory = (req, res,next) => {
    const categoryId = req.params.categoryId;
    Note
    .find({categoryId: categoryId})
    .then(notes => {
        if (!notes){
            const error = new Error('This category does not have any notes');
            error.statusCode = 404;
            throw error; 
        }
        res.status(200).json({ message: 'Notes pertaining to this category are found', categoryNotes: notes})
    })
    .catch(err => {
        if (!err.statusCode){
            err.statusCode = 500; 
        }
        next(err); 
    }); 
}

//sort by update date
exports.sortByUpdateDate = (req, res, next) => {
    Note
    .aggregate([
        {$project: {
            _id: 0,
            title: 1,
            updatedAt: 1
        }},
        {$sort: {updatedAt: -1}}
    ])
    .then(notes => {
        res.status(201).json({
            message: 'Notes Sorted Successfully',
            sortedNotes: notes 
        })
    })
    .catch( err => {
        if (!err.statusCode){
            err.statusCode = 500; 
        }
        next(err);  
    })
}

exports.searchByTag = (req, res, next) => {
    const keyword = req.body.keyword;
    if (keyword.length>3){
        const error = new Error('Cannot search using more than 3 tags');
        error.statusCode = 404;
        throw error;
    }
    Note
    .aggregate([
        {$match: {$or: [{tag: keyword[0]}, {tag: keyword[1]}, {tag: keyword[2]}] } },
        {$project: {
            _id:0,
            title: 1,
            tag: 1
        }}
    ])
    .then(notes => {
        if (!notes){
            const error = new Error('No notes having this tag are found');
            error.statusCode = 404;
            throw error; 
        } 
        res.status(201).json({
            message: 'Search By Tag Done',
            notesWithTag: notes 
        })
    })
    .catch( err => {
        if (!err.statusCode){
            err.statusCode = 500; 
        }
        next(err);  
    });
};