# vueform for Laravel

## Features

* Send your forms easy with ajax
* Uses Laravel backend validation so no need to add frontend validation anymore
* Does not use the old way of html forms
* Supports POST, PUT, DELETE, PATCH and UPDATE
* Always send the form with multipart/form-data so easy to add files 
* Support for sending data as JSON object whats making sending null and bolean values possible
* A lot of functions for validation, rendering and data transformations

There is always a bit of a struggle in what multipart type you want to send your values. If you want to send files through the request the only way to go is to use "application/x-www-form-urlencoded". But this type got problems with with typecasting values and non support voor booleans (which got difficulties with Laravel validation).

In my recent projects I switched to post my values always as json. There is a middleware in this package that can transform the json to a normal request. You can go from here exactly the same as you did before, and the data got the same type as is was send from.

## Donate

Find this project useful? You can support me on Patreon

https://www.patreon.com/pixsil

## Installation

For a quick install, run this from your project root:
```bash
mkdir -p resources/js/tools/vue-form
wget -O resources/js/tools/vue-form/vue-form.js https://raw.githubusercontent.com/pixsil/vueform/main/vueForm.js
wget -O resources/js/tools/vue-form/vue-error.js https://raw.githubusercontent.com/pixsil/vueform/main/vueError.js
```

Add this to your app.js
```javascript
require('./tools/vue-form/vue-form.js');
require('./tools/vue-form/vue-error.js');
```

When you want to send data as JSON in Laravel. Use the following middleware:
```bash
wget -O app/Http/Middleware/ParseFormDataMiddleware.php https://raw.githubusercontent.com/pixsil/vueform/main/middleware/ParseFormDataMiddleware.php
```

And include this middleware inside the kernel (in $middleware array):
```php
\App\Http\Middleware\ParseFormDataMiddleware::class,
```

## Usage
You can use the vueform object inside your data object in the Vue component. You need to give the object field that should be posted. Only the fields by init will be send by the post. There are several functions to change these initial fields later on.
```javascript
data() {
    return {
        vueForm: new VueForm(
            {
                'name': null,
                'age': null,
            },
        )
    }
}
```

You can send your form like this. You can also use delete, patch, put or even get (see info for get below).

```javascript
    methods: {
        submit() {
            this.vueForm.post('/register')
                .then(response => this.onSuccess())
        },
        onSuccess() {
            // do something on success
        },
    },
```

If you like to use a variable as method you can also use the submit(method, url) function. Like so:
```javascript
    let method = 'patch';

    this.vueForm.submit(method, '/update')
        .then(response => this.onSuccess())
```

If you want to send the data as JSON (in combination with the middleware for Laravel) you can init the VueForm object with the second parameter true. Or set it true with sendJsonFormData afterwards.

```javascript
// by init
data() {
    return {
        vueForm: new VueForm(
            {
                'name': null,
                'age': null,
            },
            true, // <-----
        )
    }
}

// after init
vueForm.sendJsonFormData = true;
```


## Render functions

There are several functions you can use to block different parts of the form by different states. For example the function 'isSaveAvailable()' gives 'true' if the form is not doing a request, got at least one value changed and does not have unsolved validation errors.

### isSaveAvailable()

True if:
- Not doing a request
- No validation errors
- At least one value has changes (handy if it is an edit form)

```vue
<button @click="submit()" :disabled="!vueForm.isSaveAvailable()">Submit</button>
```

### isBusy()

True if the form is doing a request. The form can handle multiple requests at once.

```vue
<div v-if="vueForm.isBusy()">Wait a second please.</div>
```

### isResetAvailable()

This function is mostly used for on the reset button. It is the same function as 'isSaveAvailable()' only without checkin on validation errors. 

True if:
- Not doing a request
- At least one value has changes (handy if it is an edit form)

```vue
<button @click="resetFormdata()" :disabled="!vueForm.isResetAvailable()">Reset</button>
```

If you also like to check if the field 

### isChanged()

The function 'isChanged()' gives true if one of the values is different from the original values.

```vue
<div v-if="vueForm.isChanged()">Dont forget to save your changes!</div>
```

## Validation functions

All the fields are validated by Laravel validation. If there is an error in one of the fields it will store the error in the vueError object. You can use the following functions.

Check if we have errors:
```vue
vueForm.vueErrors.any()
```

Get an error:
```vue
vueForm.vueErrors.get(field)
```

Clear one or more errors
```vue
// clear one error
vueForm.vueErrors.clear(field)

// clear all erros
vueForm.vueErrors.clear()

// gives true if there are errors
vueForm.vueErrors.has()
```

## Data functions
 
By init the form saves all the form data to an array of original data to check whether the data is changed.

Whit the following functions you can change the data, the original data or both of them.

With 'updateData()' there can be updated multiple values at once. This can be handy if the data must be updated after a request.

```vue
vueForm.updateData({
    'name': 'John',
    'age': 18,
})
```

Init data changes the original and the current data.

```vue
vueForm.initData({
    'name': 'John',
    'age': 18,
})
```

If you would like to set the current data as original, it can be done with vueForm.setCurrentDataAsOriginal();

```vue
vueForm.setCurrentDataAsOriginal();
```

The function 'resetFormdata()' resets the formdata with the original formData. It also removes all the validation errors.

```vue
<button @click="resetFormdata()" :disabled="!vueForm.isResetAvailable()">Reset</button>
```

## Additional knowledge

###  Data transformation

The form automatically filters undefined and null values. Date objects will be converted to date stings. This is done without converting with ISO timestamps to prevent timezone issues

###  Populate after request

You can automatically populate the form after a request by giving a data object back.

In your Laravel controller:
```php
    return [
        'data' => [
            'field' => 'Fill with this value',
        ]
    ];
```

###  Redirect after request

It is possible that you like to redirect after the form has successfully saved. You can do this in your controller by adding the redirect parameter in the response data. The VueForm automatically redirects after the form is done.

In your Laravel controller:
```php
    return ['redirect' => route('users.edit', [$user->id])];
```


It is also possible to use the 'get()' function to the form to load a form with data.

###  Global message

The global message is filled with the response message from the 422 exception. This is in Laravel used to give back a global message. You can use this functionality if you would like to add a global error message that is not field related.

On all the the other http errors codes the message is filled with a default error text. You can also use your own error messages, see example below.

```vue
<div v-if="vueForm.vueErrors.global_message" class="alert alert-warning" role="alert">
     {{ vueForm.vueErrors.global_message }}
</div>
```

You can use the global message if you have an error that is not field related. In Laravel you can fill the error like this:

```php
abort(422, 'Je kan niet meer afroepen dan er beschikbaar is.');
```

The default 422 response code is "The given data was invalid.". I only like to show custom messages. A good approche to accomplish this is to only show the message if it is not filled with the default message. Something like this:

```vue
<div v-if="vueForm.vueErrors.global_message && vueForm.vueErrors.global_message !== 'The given data was invalid.'" class="alert alert-warning" role="alert">
     {{ vueForm.vueErrors.global_message }}
</div>
```

###  Error message

The global message (see above) is only filled when with http status code 422. For all the other http codes the error_message variable is filled. This could be used for debugging. It is not smart you show this error in the frontend, because it often a technical description.

You can find the error message in the VueErros object in side the VueForm object. For example to see the error in console:

```javascript
$vm0.vueForm.vueErrors.error_message
```


###  Send null values

By default the null values do not get send within the post. You can change this behauvior by setting the option 'doNotSendEnptyValues' to false.

```vue
this.vueForm.doNotSendEnptyValues = false;
```

Keep in mind that Laravel is removing empty stings and replace them with null values in the middleware.

###  Validation component

This class work seamlessly with the validation component. Its small and works out of the box! See also the 'pix-validation' implementation in the example folder.

```vue
<pix-validate :vue-form="vueForm" field="fieldname"></pix-validate>
```

## Example

Check the example folder for a Vue component example
