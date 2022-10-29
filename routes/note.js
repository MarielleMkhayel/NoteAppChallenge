const express = require('express');

const {body} = require('express-validator');

const noteControllers = require('../controllers/note');
const isAuth = require('../middleware/is-auth');
const Category = require('../models/category');
const Note = require('../models/note');

const router = express.Router();

//read note
router.get('/getNotes',isAuth, noteControllers.getNotes );
router.get('/getNote/:noteId',isAuth, noteControllers.getNote);

//create note
router.post('/addNote/:categoryId', isAuth,
[
    body('title', 'Note title should contain a minimum of one character and a maximum of 30 characters')
    .custom((value, {req}) => { 
        return Note.findOne({title: value}).then(note => {
            if (note){
                return Promise.reject('Note title already exists');
            }
        })
    })
    .isLength({min: 1, max: 30})
    .trim()
    .isString(),
    body('text', 'Note content should have a minimum of one character')
    .isLength({min: 1})
    .trim()
    .isString(),

]
,noteControllers.postAddNote )

//edit note
router.post('/editNote/:noteId', isAuth,
[
    body('title', 'Note title should contain a minimum of one character and a maximum of 30 characters')
    .custom((value, {req}) => { 
        return Note.findOne({title: value}).then(note => {
            if (note){
                return Promise.reject('Note title already exists');
            }
        })
    })
    .isLength({min: 1, max: 30})
    .trim()
    .isString()
    ,
    body('text', 'Note content should have a minimum of one character')
    .isLength({min: 1})
    .trim()
    .isString(),

],
 noteControllers.editNote);

//delete note
router.delete('/deleteNote/:noteId', isAuth, noteControllers.deleteNote);

//read category
router.get('/getCategories',isAuth, noteControllers.getCategories );

//create category
router.post('/addCategory', isAuth,
[
    body('title', 'Category title should contain a minimum of one character and a maximum of 30 characters')
    .custom((value, {req}) => { 
        return Category.findOne({title: value}).then(category => {
            if (category){
                return Promise.reject('Category already exists');
            }
        })
    })
    .isLength({min: 1, max: 30})
    .trim()
    .isString()
    ,
    body('description', 'Category should contain no more than 100 characters')
    .isLength({max: 100})
    .trim()
    .isString()
]
,noteControllers.postAddCategory )

//edit category
router.post('/editCategory/:categoryId', isAuth, [
    body('title', 'Category title should contain a minimum of one character and a maximum of 30 characters')
    .custom((value, {req}) => { 
        return Category.findOne({title: value}).then(category => {
            if (category){
                return Promise.reject('Category already exists');
            }
        })
    })
    .isLength({min: 1, max: 30})
    .trim()
    .isString()
    ,
    body('description', 'Category should not contain less than 1 character or more than 100 characters')
    .isLength({min:1, max: 100})
    .trim()
    .isString()
],
noteControllers.editCategory);

//delete category
router.delete('/deleteCategory/:categoryId', isAuth, noteControllers.deleteCategory);

//filter by category
router.get('/getCategory/:categoryId',isAuth, noteControllers.getCategory);

//sort by update Date
router.get('/sortByUpdateDate', isAuth, noteControllers.sortByUpdateDate);

//search by tags
router.post('/searchByTag', isAuth, noteControllers.searchByTag);

module.exports = router;