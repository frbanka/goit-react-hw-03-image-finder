import React, { Component } from 'react';
import Searchbar from './Searchbar/Searchbar';
import ImageGallery from './ImageGallery/ImageGallery';
import Button from './Button/Button';
import fetchPhotos from './Fetch/Fetch';
import Modal from './Modal/Modal';
class App extends Component {
  state = {
    search: '',
    page: 1,
    totalImg: 0,
    imgPerPage: 0,
    isLoading: false,
    modalOn: false,
    images: [],
    error: null,
    currentImgUrl: null,
    currentImgDescription: null,
  };
  searchRequest = search => {
    this.setState({ search, images: [], page: 1 });
  };
  loadMoreImg = () => {
    this.setState(({ page }) => ({ page: page + 1 }));
  };

  componentDidUpdate(prevProps, prevState) {
    const { search, page } = this.state;

    if (prevState.search !== search) {
      this.setState(({ isLoading }) => ({ isLoading: !isLoading }));

      fetchPhotos(search)
        .then(({ hits, totalHits }) => {
          const imagesArray = hits.map(hit => ({
            id: hit.id,
            description: hit.tags,
            smallImage: hit.webformatURL,
            largeImage: hit.largeImageURL,
          }));

          return this.setState({
            page: 1,
            images: imagesArray,
            imgPerPage: imagesArray.length,
            totalImg: totalHits,
          });
        })
        .catch(error => this.setState({ error }))
        .finally(() =>
          this.setState(({ isLoading }) => ({ isLoading: !isLoading }))
        );
    }

    if (prevState.page !== page && page !== 1) {
      this.setState(({ isLoading }) => ({ isLoading: !isLoading }));

      fetchPhotos(search, page)
        .then(({ hits }) => {
          const imagesArray = hits.map(hit => ({
            id: hit.id,
            description: hit.tags,
            smallImage: hit.webformatURL,
            largeImage: hit.largeImageURL,
          }));

          return this.setState(({ images, imgPerPage }) => {
            return {
              images: [...images, ...imagesArray],
              imgPerPage: imgPerPage + imagesArray.length,
            };
          });
        })
        .catch(error => this.setState({ error }))
        .finally(() =>
          this.setState(({ isLoading }) => ({ isLoading: !isLoading }))
        );
    }
  }
  openModal = () => this.setState({ modalOn: true });

  closeModal = () => this.setState({ modalOn: false });

  getImageLink = id => {
    const currentImgLink = this.state.images.find(
      item => item.id === Number(id)
    );
    const bigImage = { currentImgLink };
    this.setState({ currentImgUrl: bigImage });
    this.openModal();
  };

  render() {
    const { images, imgPerPage, totalImg, modalOn, currentImgUrl } = this.state;

    const startSearch = this.searchRequest;
    const loadMoreImg = this.loadMoreImg;

    return (
      <div>
        <Searchbar onSubmit={startSearch} />
        {images && (
          <ImageGallery images={images} largeImage={this.getImageLink} />
        )}
        {imgPerPage >= 12 && imgPerPage < totalImg && (
          <Button loadMore={loadMoreImg} />
        )}
        {modalOn && (
          <Modal modalClose={this.closeModal}>
            <img src={currentImgUrl} alt="" />
          </Modal>
        )}
      </div>
    );
  }
}
export default App;
