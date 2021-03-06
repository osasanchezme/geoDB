// const { auth } = require("firebase-admin");

// const { auth } = require("firebase");

const loggedOutLinks = document.querySelectorAll('.logged-out')
const loggedInLinks = document.querySelectorAll('.logged-in')
const loggedInForms = document.querySelectorAll('.formul')
var userUid = null; // Id del usuario para trar info 

const loginCheck = user => {
    if (user) {
        loggedInLinks.forEach(link => {link.style.display = 'block'})
        loggedOutLinks.forEach(link => {link.style.display = 'none'})
        loggedInForms.forEach(container => {container.style.display = 'block'})

    } else {
        loggedInLinks.forEach(link => {link.style.display = 'none'})
        loggedOutLinks.forEach(link => {link.style.display = 'block'})
        loggedInForms.forEach(container => {container.style.display = 'none'})

    }
}

//SignUp
const signupForm = document.querySelector('#signup-form');

signupForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const email = document.querySelector('#signup-email').value;
    const password = document.querySelector('#signup-password').value;

    // console.log(email)
    // console.log(password)

    auth
        .createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            //clear the form
            signupForm.reset()
            $('#signupModal').modal('hide')
            // console.log('sign up')
        })
})

//Login
const signinForm = document.querySelector('#signin-form');

signinForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const email = document.querySelector('#signin-email').value;
    const password = document.querySelector('#signin-password').value;

    // console.log(email)
    // console.log(password)

    auth
        .signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            //clear the form
            signinForm.reset()
            $('#signinModal').modal('hide')
            // console.log('sign in correcto')
        })
})

//Logout
const logout = document.querySelector('#logout')

logout.addEventListener('click', e => {
    e.preventDefault()
    auth.signOut().then(() => {
        // console.log('Sign out correcto')
    })
})

//Insertar tareas

const taskform = document.querySelector('#task-form');
const taskContainer = document.querySelector('#tasks-container');
var editStatus = false
var id =''
const onGetTasks = (callback) => db.collection(userUid).onSnapshot(callback) //Cada vez que hay cambios actualiza
const deleteTask = id => db.collection(userUid).doc(id).delete()

const saveTask = (title,description) => { // Guarda los datos
    db.collection(userUid).doc().set({
        "title": title,
        "description": description
    })
}

// const getTasks = () => db.collection('tasks').get(); //Carga las tareas de firebase
const getTask = (id) => db.collection(userUid).doc(id).get();
const updateTask = (id, updatedTask) => db.collection(userUid).doc(id).update(updatedTask)

    //Cuando carga la pagina quiero que se muestren las tareas guardadas

window.addEventListener('DOMContentLoaded', async (e) => { 

    
    onGetTasks((querySnapshot) => { // Cada vez que se cambia algo de la db se ejecuta
        taskContainer.innerHTML = '' // Lo pongo en blanco para que no se dupliquen los datos
        querySnapshot.forEach(doc => {

            
            // console.log(doc.data())
    
            const task = doc.data();
            task.id = doc.id;

            taskContainer.innerHTML += `<div class="card card-body mt-2 border-primary">
                    <h3 class="h5">${task.title}</h3>
                    <p>${task.description}</p>
                    <div>
                        <button class='btn btn-primary btn-delete' data-id="${task.id}">Delete</button>
                        <button class='btn btn-info btn-edit' data-id="${task.id}">Edit</button>
                    </div> 
                    </div> `;

            const btnsDelete = document.querySelectorAll('.btn-delete')
            btnsDelete.forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    // console.log(e.target.dataset['id']) // o .id
                    await deleteTask(e.target.dataset['id'])
                })
            })

            const btnEdit = document.querySelectorAll('.btn-edit')
            btnEdit.forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const doc = await getTask(e.target.dataset['id'])
                    const task = doc.data()

                    editStatus = true
                    id = doc.id
                    // console.log('ID', id)

                    taskform['task-title'].value = task.title
                    taskform['task-description'].value = task.description
                    taskform['btn-task-form'].innerText = 'Update'
                })
            })
        })
    })

    


})


taskform.addEventListener('submit', async (e) => {
    e.preventDefault()

    const title = taskform['task-title'];
    const description = taskform['task-description'];

    if (!editStatus){
        await saveTask(title.value, description.value);
    } else {
        await updateTask(id, {
            "title": title.value,
            "description": description.value
        })

        editStatus = false
        id = ''
        taskform['btn-task-form'].innerText = 'Save'

        
    }

    taskform.reset()
    title.focus()
})


//Posts
const postList = document.querySelector('.posts');

const setupPosts = data => {
    if (data.length) {
        let html = '';
        data.forEach(doc => {
            const post = doc.data();
            // console.log(post)
            const li = `
                <li style="text-align:center" class='list-group-item list-group-item-action'>
                    <h5>${post.title}</h5>
                    <p style="text-align:justify">${post.description}</p>
                </li>
            `; 
            html += li;
        })
        postList.innerHTML = html;
    } else {
        postList.innerHTML = `<p class="text-center" ><h5>Inicie sesión para mostrar información de sus proyectos</h5></p>
                                <div class="view overlay zoom">
                                    <img src="logo.png" class="img-fluid " alt="smaple image">
                                </div>
        `
    }
};

const dataTitle = document.querySelector('#table-title');
const dataList = document.querySelector('#table-body');

const setupData = (obj) => {
    keys = Object.keys(obj)

    if (keys.length) {
        let html = '';
        keys.forEach(key => {
            const th = `
                <th scope="col" style ="word-break:break-all;">${key}</th>
            `; 
            html += th;
        })
        dataTitle.innerHTML = html;

        html = '';
        Object.keys(obj).forEach(key => {
            console.log(key, obj[key]);

            const td = `
            <td>${obj[key]}</th>
            `; 
            html += td;
          });
          dataList.innerHTML = html;
    } else {
        dataTitle.innerHTML = ''
        dataList.innerHTML = ''
    }
};

var dict = {}
var dict2 = {}
const unpack = (obj, lenObj, ID, status, ID_prev, i, dicc, col) => {Object.keys(obj).forEach(key => {
    console.log('adentral')

    console.log('OBJJJ', obj)
    console.log('KEY', key)
    console.log('OBJ[KEY]', obj[key])

    if (typeof (obj[key]) === 'object') {

        var id = ''
        color_btn = ['btn-outline-primary', 'btn-outline-primary', 'btn-outline-success', 'btn-outline-primary', 'btn-outline-info',
                 'btn-outline-warning', 'btn-outline-danger']

        color = ['text-primary', 'text-primary', 'text-secondary', 'text-success', 'text-danger',
                 'text-warning', 'text-info']

        color_tr = ['table-primary', 'table-primary', 'table-success', 'table-primary','table-info', 'table-warning', 'table-danger']
            
        id = key + uniqueID() // Para crear ids unicos
        dicc = get(dicc, ID, [color_btn[i], color_tr[i]])

        console.log('id', id, 'ID', ID, 'ID_prev', ID_prev)
        


            if (status === true) {
                t = `
                <tr>
                    <td colspan="10">
                        <div class="${ID} collapse" id="${key+ID}" >
                            <button class="btn ${dicc[ID][0]} btn-sm" type="button" data-toggle="collapse" data-target=".${id}" aria-expanded="false" aria-controls="${id}">
                                ${key}
                            </button>
                        </div>    

                        <div class = "collapse ${id}" >
                            <table class="table table-bordered" >
                                <tbody id="tbody${id}">
                                    
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
                `;

                var doc = document.querySelector('#tbody'+ID)
                
            } else {
                t = `
                <div id="${key+ID}">
                    <table class="table borderless w-auto small table-sm" >
                        <tbody>
                            <tr>
                                <td>
                                    <button class="btn btn-outline-primary btn-sm" type="button" data-toggle="collapse" data-target=".${id}" aria-expanded="false" aria-controls="${id}">
                                        ${key}
                                    </button>
                                </td>
                                <td>
                                    <div class = "collapse ${id}" >
                                        <table class="table table-bordered">
                                            <tbody id="tbody${id}">
                                                
                                            </tbody>
                                        </table>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                
                `;

                var doc = document.querySelector('#inicio');

            }
    
            doc.innerHTML += t;

            i+=1

            var color = dicc[ID][1]
            console.log(document.documentElement.innerHTML)
            
            unpack(obj[key], Object.values(obj[key]).filter( v => typeof v === 'object').length, id, true, key+ID, i, dicc, color);
        
    } else {

        color_tr = ['table-primary', 'table-success', 'table-info', 'table-warning', 'table-danger']

        t_r = `
                        <tr class="${col}">
                            <th scope="row">${key}</td>
                            <td>${obj[key]}</td>
                        </tr>
            `

        var docInfo = document.querySelector('#tbody'+ID);
        docInfo.innerHTML += t_r;

        console.log('id2', id, 'ID', ID, 'ID_prev', ID_prev)
    
    } 

    
})
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }

function uniqueID() {
    return Math.floor(Math.random() * Date.now())
    }   

function get(object, key, default_value) {
    if (typeof object[key] == "undefined") {
        object[key] = default_value
    }
    // var result = object[key];
    return object
}

//Google Login
const googleButton = document.querySelector('#googleLogin');

googleButton.addEventListener('click', e => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then(result => {
            // console.log('Google sign in')
            signinForm.reset()
            $('#signinModal').modal('hide')
        }).catch(error => {
            // console.log('mistake')
        })
});

//Facebook Login

const facebookButton = document.querySelector('#facebookLogin')

facebookButton.addEventListener('click', e => {
    e.preventDefault();
    const provider = new firebase.auth.FacebookAuthProvider();
    auth.signInWithPopup(provider)
        .then(result => {
            // console.log(result)
            signinForm.reset()
            $('#signinModal').modal('hide')
        }).catch(error => {
            // console.log(error)
        })
})

//Events
//List data for auth state changes
auth.onAuthStateChanged(user => {
    if (user) {
        userUid = user.uid
        db.collection('posts')
            .get()
            .then((snapshot) => {
                // console.log(snapshot.docs)
                setupPosts(snapshot.docs);
                loginCheck(user);
            })    
            onGetTasks((querySnapshot) => { // Cada vez que se cambia algo de la db se ejecuta
                taskContainer.innerHTML = '' // Lo pongo en blanco para que no se dupliquen los datos
                querySnapshot.forEach(doc => {
        
                    
                    // console.log(doc.data())
            
                    const task = doc.data();
                    task.id = doc.id;
        
                    taskContainer.innerHTML += `<div class="card card-body mt-2 border-primary">
                            <h3 class="h5">${task.title}</h3>
                            <p>${task.description}</p>
                            <div>
                                <button class='btn btn-primary btn-delete' data-id="${task.id}">Delete</button>
                                <button class='btn btn-info btn-edit' data-id="${task.id}">Edit</button>
                            </div> 
                            </div> `;
        
                    const btnsDelete = document.querySelectorAll('.btn-delete')
                    btnsDelete.forEach(btn => {
                        btn.addEventListener('click', async (e) => {
                            // console.log(e.target.dataset['id']) // o .id
                            await deleteTask(e.target.dataset['id'])
                        })
                    })
        
                    const btnEdit = document.querySelectorAll('.btn-edit')
                    btnEdit.forEach(btn => {
                        btn.addEventListener('click', async (e) => {
                            const doc = await getTask(e.target.dataset['id'])
                            const task = doc.data()
        
                            editStatus = true
                            id = doc.id
                            // console.log('ID', id)
        
                            taskform['task-title'].value = task.title
                            taskform['task-description'].value = task.description
                            taskform['btn-task-form'].innerText = 'Update'
                        })
                    })
                })
            })

            dbRt.ref('ARS43P1').on('value',(snap)=>{
                obj = snap.val(); //equivalente a Dictionary en pyhon
                // var keys = Object.keys(obj); // Obtiene las llaves del objeto
                console.log(typeof obj)
                obj = {'ARS43P1': obj}
                var idInicial = ''
                Object.values(obj).filter( v => { 
                    if (typeof v === 'object') {
                        idInicial = getKeyByValue(obj, v)
                    }
                })
                console.log(idInicial)
                setupData(obj)
                
                unpack(obj, Object.values(obj).filter( v => typeof v === 'object').length, idInicial, false, 'inicio', 0, dict, '')
                console.log('objjjj', Object.keys(snap.child('ESTRATOS').val()))
              });
    } else {
        userUid = null
        setupPosts([]);
        setupData([]) 
        loginCheck(user);
        // Cada vez que se cambia algo de la db se ejecuta
        taskContainer.innerHTML = '' // Lo pongo en blanco para que no se dupliquen los datos
        }
    })