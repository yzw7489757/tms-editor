import React from 'react';
import PreviewContainer from 'components/PreviewContainer';
import Iphone from 'components/Iphone';
import ComponentTree from 'components/ComponentTree';
import less from './index.module.less';

const Dragger = () => (
  <div className={less.wrap}>
    <div className={less.mobile}>
      <div className={less.preview}>
        <Iphone>
          <PreviewContainer />
        </Iphone>
      </div>
    </div>
    <div className={less.componentBase}>
      <ComponentTree />
    </div>
  </div>
);

export default Dragger;
