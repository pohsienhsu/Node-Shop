

const deleteProduct = (btn) => {
  const prodId = btn.parentNode.querySelector('[name=id]').value;
  const csrfToken = btn.parentNode.querySelector('[name=CSRFToken').value;
  console.log(`/admin/product/${prodId}`);
  fetch('/admin/product/' + prodId, {
    method: 'DELETE',
    headers: {
      'csrf-token': csrfToken
    }
  }).then(result => {
    console.log(result);
  }).catch(err => {
    console.log("Something went wrong!");
    console.log(err);
  })
}